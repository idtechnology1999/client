import { useState, useEffect } from "react";
import axios from "axios";
const api_url = import.meta.env.VITE_API_BASE_URL;

interface lists {
  task: string;
  id: number;
}

export default function MyTodo() {
  const [sendTask, setsendTask] = useState("");
  const [message, setmessage] = useState("");
  const [GetList, SetGetList] = useState<lists[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
// fetch all tasks
function allfunction() {
  axios
    .get(`${api_url}/api/GetList`)
    .then((getresponse) => {
      const data = getresponse.data;

      // Ensure GetList is always an array
      const list = Array.isArray(data.List) 
        ? data.List        // if response is { List: [...] }
        : Array.isArray(data) 
        ? data             // if response is just [...]
        : [];              // fallback to empty array

      SetGetList(list);
    })
    .catch((err) => {
      console.error("GetList error:", err);
      SetGetList([]); // fallback to empty array
    });
}

  useEffect(() => {
    allfunction();
  }, []);

  // add new task (guard empty)
  const addlist = () => {
    if (!sendTask.trim()) {
      setmessage("Please enter a task.");
      return;
    }
    axios
      .post(`${api_url}/api/AddList`, { Task: sendTask })
      .then((addResponse) => {
        setmessage(addResponse.data.status);
        // refresh server list (keeps UI consistent)
        allfunction();
        setsendTask("");
      })
      .catch((err) => {
        setmessage(`Error adding: ${err.message}`);
      });
  };

  // single edit (keeps original behavior)
  function Edit(id: number) {
    axios
      .put(`${api_url}/api/Update`, { id })
      .then((editresponse) => {
        setmessage(editresponse.data.status);
      })
      .catch((err) => {
        setmessage(`unable to update (ID: ${id}): ${err.message}`);
      });
  }

  // single delete — optimistic UI update (no reload)
  function Delete(id: number) {
    // optimistic local remove so UI is snappy
    SetGetList((prev) => prev.filter((item) => item.id !== id));
    // also remove from selectedIds if present
    setSelectedIds((prev) => prev.filter((x) => x !== id));

    axios
      .delete(`${api_url}/api/Delete/${id}`)
      .then((deleteresponse) => {
        setmessage(deleteresponse.data.status);
        // If backend failed to delete, refetch to restore correct state
      })
      .catch((err) => {
        setmessage(`unable to delete (ID: ${id}): ${err.message}`);
        // fallback: re-fetch full list to ensure consistency
        allfunction();
      });
  }

  // toggle checkboxes
  function toggleCheckbox(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

function DeleteSelected() {
  if (selectedIds.length === 0) {
    alert("Please select at least one task to delete.");
    return;
  }

  axios
    .post(`${api_url}/api/DeleteMany`, { ids: selectedIds }) // ✅ use POST instead
    .then((response) => {
      setmessage(response.data.status);
      setSelectedIds([]);
      // update UI without reload
      SetGetList((prev) => prev.filter((task) => !selectedIds.includes(task.id)));
    })
    .catch((error) => {
      setmessage(`Error deleting selected: ${error.message}`);
    });
}


  return (
    <div className="container py-5" style={{ maxWidth: "600px" }}>
      {message && (
        <div className="alert alert-primary" role="alert">
          <strong>Alert: </strong> {message}
        </div>
      )}

      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-4">
          <h3 className="card-title mb-4 text-center text-primary">
            <i className="bi bi-list-check me-2"></i>My To-Do List
          </h3>

          <div className="input-group mb-4">
            <input
              type="text"
              onChange={(e) => setsendTask(e.target.value)}
              value={sendTask}
              className="form-control form-control-lg border-end-0 rounded-start-pill"
              placeholder="Add a new task..."
            />
            <button className="btn btn-lg btn-primary rounded-end-pill" onClick={addlist}>
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>

          <ul className="list-group list-group-flush">
            {GetList.length === 0 ? (
              <div className="alert alert-warning">No data available yet</div>
            ) : (
              GetList.map((List, index) => (
                <li
                  key={List.id ?? index}
                  className="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom py-3"
                >
                  <div className="form-check">
                    <input
                      className="form-check-input me-2"
                      type="checkbox"
                      checked={selectedIds.includes(List.id)}
                      onChange={() => toggleCheckbox(List.id)}
                      id={`task-${List.id}`}
                    />
                    <label className="form-check-label" htmlFor={`task-${List.id}`}>
                      {List.task}
                    </label>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-outline-success me-2" onClick={() => Edit(List.id)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => Delete(List.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <button className="btn btn-outline-danger btn-sm" onClick={DeleteSelected} disabled={selectedIds.length === 0}>
              <i className="bi bi-trash2-fill me-1"></i> Delete Selected ({selectedIds.length})
            </button>

            <span className="text-muted small">{GetList.length} tasks total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
