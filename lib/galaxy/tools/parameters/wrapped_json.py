import logging

import packaging.version

log = logging.getLogger(__name__)

SKIP_INPUT = object()


def json_wrap(inputs, input_values, profile, as_dict=None, handle_files="skip"):
    if as_dict is None:
        as_dict = {}

    for input in inputs.values():
        input_name = input.name
        value_wrapper = input_values[input_name]
        json_value = _json_wrap_input(input, value_wrapper, profile,
                                      handle_files=handle_files)
        if json_value is SKIP_INPUT:
            continue
        as_dict[input_name] = json_value
    return as_dict


def _json_wrap_input(input, value_wrapper, profile, handle_files="skip"):
    input_type = input.type

    def _data_input_to_path(v):
        path = _cast_if_not_none(v, str)
        if path == "None":
            path = None
        return path

    if input_type == "repeat":
        repeat_job_value = []
        for d in value_wrapper:
            repeat_instance_job_value = {}
            json_wrap(input.inputs, d, profile, repeat_instance_job_value,
                      handle_files=handle_files)
            repeat_job_value.append(repeat_instance_job_value)
        json_value = repeat_job_value
    elif input_type == "conditional":
        values = value_wrapper
        current = values["__current_case__"]
        conditional_job_value = {}
        json_wrap(input.cases[current].inputs, values, profile,
                  conditional_job_value, handle_files=handle_files)
        test_param = input.test_param
        test_param_name = test_param.name
        test_value = _json_wrap_input(test_param, values[test_param_name],
                                      profile, handle_files=handle_files)
        conditional_job_value[test_param_name] = test_value
        json_value = conditional_job_value
    elif input_type == "section":
        values = value_wrapper
        section_job_value = {}
        json_wrap(input.inputs, values, profile, section_job_value, handle_files=handle_files)
        json_value = section_job_value
    elif input_type == "data" and input.multiple:
        if handle_files == "paths":
            json_value = list(map(_data_input_to_path, value_wrapper))
        elif handle_files == "skip":
            return SKIP_INPUT
        else:
            raise NotImplementedError()
    elif input_type == "data":
        if handle_files == "paths":
            json_value = _data_input_to_path(value_wrapper)
        elif handle_files == "skip":
            return SKIP_INPUT
        elif handle_files == "OBJECT":
            if value_wrapper:
                if isinstance(value_wrapper, list):
                    value_wrapper = value_wrapper[0]
                json_value = _hda_to_object(value_wrapper)
                if input.load_contents:
                    with open(str(value_wrapper), mode='rb') as fh:
                        json_value['contents'] = fh.read(input.load_contents).decode('utf-8', errors='replace')
                return json_value
            else:
                return None
        else:
            raise NotImplementedError()
    elif input_type == "data_collection":
        if handle_files == "skip":
            return SKIP_INPUT
        raise NotImplementedError()
    elif input_type in ["text", "color", "hidden"]:
        json_value = _cast_if_not_none(value_wrapper, str)
    elif input_type == "float":
        json_value = _cast_if_not_none(value_wrapper, float, empty_to_none=True)
    elif input_type == "integer":
        json_value = _cast_if_not_none(value_wrapper, int, empty_to_none=True)
    elif input_type == "boolean":
        if input.optional and value_wrapper is not None and value_wrapper.value is None:
            json_value = None
        else:
            json_value = _cast_if_not_none(value_wrapper, bool, empty_to_none=input.optional)
    elif input_type == "select":
        if input.multiple and packaging.version.parse(str(profile)) >= packaging.version.parse('20.05'):
            json_value = [_ for _ in _cast_if_not_none(value_wrapper.value, list)]
        else:
            json_value = _cast_if_not_none(value_wrapper, str)
    elif input_type == "data_column":
        # value is a SelectToolParameterWrapper()
        if input.multiple:
            json_value = [int(_) for _ in _cast_if_not_none(value_wrapper.value, list)]
        else:
            json_value = [_cast_if_not_none(value_wrapper.value, int)]
    else:
        raise NotImplementedError("input_type [%s] not implemented" % input_type)

    return json_value


def _hda_to_object(hda):
    hda_dict = hda.to_dict()
    metadata_dict = {}

    for key, value in hda_dict.items():
        if key.startswith("metadata_"):
            metadata_dict[key[len("metadata_"):]] = value

    return {
        'file_ext': hda_dict['file_ext'],
        'file_size': hda_dict['file_size'],
        'name': hda_dict['name'],
        'metadata': metadata_dict,
        'src': {'src': 'hda', 'id': hda.id},
    }


def _cast_if_not_none(value, cast_to, empty_to_none=False):
    # log.debug("value [%s], type[%s]" % (value, type(value)))
    if value is None or (empty_to_none and str(value) == ''):
        return None
    else:
        return cast_to(value)


__all__ = ('json_wrap', )
