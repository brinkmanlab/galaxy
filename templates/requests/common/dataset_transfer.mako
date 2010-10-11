<%inherit file="/base.mako"/>
<%namespace file="/message.mako" import="render_msg" />

%if message:
    ${render_msg( message, status )}
%endif

<h2>Datasets of Sample "${sample.name}"</h2>

<ul class="manage-table-actions">
    <li>
        <a class="action-button" href="${h.url_for( controller='requests_common', action='view_dataset_transfer', cntrller=cntrller, sample_id=trans.security.encode_id( sample.id ) )}">Refresh</a>
    </li>
    <li>
        <a class="action-button" href="${h.url_for( controller='library_common', action='browse_library', cntrller=cntrller, id=trans.security.encode_id( sample.library.id ) )}">${sample.library.name} Data Library</a>
    </li>
    <li>
        <a class="action-button" href="${h.url_for( controller='requests_common', action='manage_request', cntrller=cntrller, id=trans.security.encode_id( sample.request.id ) )}">Browse this request</a>
    </li>
</ul>

%if dataset_files:
    <div class="form-row">
        <table class="grid">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Status</th>
                </tr>
            <thead>
            <tbody>
                %for dataset_file in dataset_files:
                    <tr>
                        <td>${dataset_file.name}</td>
                        <td>${dataset_file.size}</td>
                        <td>${dataset_file.status}</td>
                    </tr>
                %endfor
            </tbody>
        </table>
    </div>
%else:
    <div class="form-row">
        There are no datasets associated with this sample.
    </div>
%endif
