import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import api from "../../api/axios";
import {
  FaPaperclip,
  FaCommentDots,
  FaUserCircle,
  FaEllipsisV,
  FaInfoCircle,
  FaTasks,
} from "react-icons/fa";


const TicketDetail = () => {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);

  const user = JSON.parse(sessionStorage.getItem("user")); 
  

  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);

  const fileInputRef = useRef(null);

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isTeamLead = user?.role === "team_lead";
  const isEmployee = user?.role === "employee";
  const isClient = user?.role === "client";

  // ownership
  const isOwner = ticket?.created_by === user?.username;

  // relations
  const sameDept = ticket?.department === user?.department?.name;
  const isAssigned = ticket?.assigned_to?.id === user?.id;

  const canEdit =
  isAdmin ||
  (isManager && isOwner) ||
  (isTeamLead && isOwner) ||
  (isClient && isOwner);

  const isClosed = ticket?.status === "closed";

  const canDelete =
    !isClosed &&
    (
      isAdmin ||
      (isManager && isOwner) ||
      (isTeamLead && isOwner && sameDept) ||
      (isClient && isOwner)
    );

  
  const canChangeStatus =
  isAdmin ||
  isManager ||
  (isTeamLead && sameDept) ||
  (isEmployee && isAssigned) ||
  (isClient && isOwner);

  const canChangePriority =
  isAdmin ||
  isManager ||
  (isTeamLead && sameDept) ||
  (isClient && isOwner);

  const canClose = canChangeStatus;

  // ===== ACTION STATES =====
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "",
    department: "",
    status: ""
  });

  const openEditModal = () => {
    setEditForm({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        department: ticket.department?.id,
        status: ticket.status, 
    });
    setShowEditModal(true);
  };

  const saveEditTicket = async () => {
    try {
      const payload = {};

      if (editForm.title) payload.title = editForm.title;
      if (editForm.description) payload.description = editForm.description;
      if (editForm.priority) payload.priority = editForm.priority;
      if (editForm.status) payload.status = editForm.status;

      await api.patch(`/tickets/${id}/update/`, payload);

      setTicket((prev) => ({
        ...prev,
        ...payload
      }));

      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const deleteTicket = async () => {
    if (!window.confirm("Are you sure to delete this ticket?")) return;

    try {
      await api.delete(`/tickets/${id}/delete/`);
      alert("Deleted successfully");
      window.location.href = "/tickets/all";
    } catch (err) {
      console.error(err.response?.data);

      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Delete failed";

      alert(errorMsg);
    }
  };

  const STATUS_OPTIONS = [
    "open",
    "assigned",
    "in_progress",
    "closed"
  ];

  const PRIORITY_OPTIONS = [
    "low",
    "medium",
    "high",
    "urgent"
  ];

  // attachment edit
  const [attachmentMenu, setAttachmentMenu] = useState(null);
  const [editAttachment, setEditAttachment] = useState(null);
  const [editAttachmentFile, setEditAttachmentFile] = useState(null);

  // comment
  const [commentMenu, setCommentMenu] = useState(null);
  const [editComment, setEditComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [showCommentEditModal, setShowCommentEditModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);

  const [visibleComments, setVisibleComments] = useState(3);

  // assign/unassign
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const navigate = useNavigate();

  // ================= FETCH =================
  const fetchTicket = async () => {
    try {
        const res = await api.get(`/tickets/${id}/`);

        const assignedUser =
        res.data.assigned_to && typeof res.data.assigned_to === "number"
          ? users.find(u => u.id === res.data.assigned_to)
          : res.data.assigned_to;

        //  ensure safe structure
        setTicket({
        ...res.data,
        comments: res.data.comments || [],
        attachments: res.data.attachments || [],
        });

    } catch (err) {
        console.error("FETCH ERROR:", err.response || err);
        alert("Failed to load ticket");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/"); 
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) {
        fetchTicket();
        fetchUsers();
        console.log("LOGGED USER:", user);
        if (ticket) console.log("ASSIGNED_BY:", ticket.assigned_by);
    }
  }, [id]);

  // ================= ADD COMMENT =================
  const handleAddComment = async () => {
    if (!comment && !file) return;

    try {
        const formData = new FormData();
        formData.append("comment", comment);
        if (file) formData.append("attachment", file);

        const res = await api.post(
        `/tickets/${id}/comments/add/`,
        formData
        );

        // ADD TO UI instantly
        setTicket((prev) => ({
        ...prev,
        comments: [res.data.data, ...prev.comments],
        }));

        setComment("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err) {
        console.error(err);
        alert("Add comment failed");
    }
  };

  // ================= DELETE COMMENT =================
  const deleteComment = async (cid) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
        await api.delete(`/tickets/${id}/comments/${cid}/delete/`);

        // REMOVE FROM UI
        setTicket((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== cid),
        }));

        setCommentMenu(null);

    } catch (err) {
        console.error(err);
        alert("Delete failed");
    }
  };

  // ================= EDIT COMMENT =================
  const handleEditComment = (c) => {
    setEditingComment(c);
    setEditText(c.comment || "");
    setEditFile(null);
    setShowCommentEditModal(true);
  };

  const saveEditComment = async (cid) => {
    try {
        const formData = new FormData();
        formData.append("comment", editText);

        if (editFile) {
        formData.append("attachment", editFile);
        }

        await api.patch(`/tickets/${id}/comments/${cid}/update/`, formData);

        // refresh
        await fetchTicket();

        //  RESET + CLOSE
        setEditText("");
        setEditFile(null);
        setEditingComment(null);
        setShowCommentEditModal(false);
        setCommentMenu(null);

    } catch (err) {
        console.error(err.response?.data || err);
        alert("Comment update failed");
    }
  };

  // ================= DELETE ATTACHMENT =================
  const deleteAttachment = async (aid) => {
    if (!window.confirm("Delete attachment?")) return;

    try {
        await api.delete(`/tickets/${id}/attachments/${aid}/delete/`);

        setTicket((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((a) => a.id !== aid),
        }));

        setAttachmentMenu(null);

    } catch (err) {
        console.error(err);
        alert("Delete failed");
    }
  };

  // ================= EDIT ATTACHMENT =================
  const saveAttachmentEdit = async (aid) => {
    try {
        const formData = new FormData();
        if (editAttachmentFile) {
        formData.append("file", editAttachmentFile);
        }

        await api.patch(`/tickets/${id}/attachments/${aid}/update/`, formData);

        setEditAttachment(null);
        setEditAttachmentFile(null);
        setAttachmentMenu(null);
        fetchTicket();

    } catch (err) {
        console.error(err);
        alert("Attachment update failed");
    }
  };

  // ================= STATUS =================
  const changeStatus = async (status) => {
    try {
        await api.patch(`/tickets/${id}/update/`, { status });

        setTicket((prev) => ({ ...prev, status }));

    } catch (err) {
        console.error(err);
        alert("Status update failed");
    }
  };

  const changePriority = async (priority) => {
    try {
        await api.patch(`/tickets/${id}/update/`, { priority });

        setTicket((prev) => ({ ...prev, priority }));

    } catch (err) {
        console.error(err);
        alert("Priority update failed");
    }
  };

  // assign ticket/ unassign ticket
  const getAssignableUsers = () => {
    if (!users) return [];

    return users.filter((u) => {
      if (u.role === "client") return false;
      if (user.role === "admin") {
        return ["admin", "manager", "team_lead", "employee"].includes(u.role);
      }
      if (user.role === "manager") {
        return ["manager", "team_lead", "employee"].includes(u.role);
      }
      if (user.role === "team_lead") {
        return (
          u.role === "team_lead" || 
          (u.role === "employee" &&
            u.department?.id === user.department?.id)
        );
      }

      return false;
    });
  };
  
  const assignTicket = async () => {
    if (!selectedUser) return alert("Select a user");

    try {
      await api.patch(`/tickets/${id}/assign/`, {
        assigned_to: selectedUser,
      });

      alert("Assigned successfully");
      fetchTicket();
      setSelectedUser("");

    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.error || "Assign failed");
    }
  };

  const unassignTicket = async () => {
    if (!ticket.assigned_to) return;

    const userId =
      ticket.assigned_to?.id || ticket.assigned_to;
    
    const assignedToId =
    typeof ticket.assigned_to === "object"
      ? ticket.assigned_to?.id
      : ticket.assigned_to;

    try {
      await api.post(
        `/tickets/${id}/unassign/${userId}/`
      );

      alert("Unassigned successfully");
      fetchTicket();

    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.error || "Unassign failed");
    }
  };

  // Close ticket
  const closeTicket = async () => {
    try {
      const res = await api.post(`/tickets/${ticket.id}/close/`);
      alert(res.data.message);
      setTicket((prev) => ({ ...prev, status: "closed" }));
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Failed to close ticket");
    }
  };

  // Reopen ticket
  const reopenTicket = async () => {
    try {
      const res = await api.post(`/tickets/${ticket.id}/reopen/`);
      alert(res.data.message);
      setTicket((prev) => ({ ...prev, status: "open" }));
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.error || "Failed to reopen ticket");
    }
  };

  if (!ticket) {
    return (
        <div className="p-6 text-center text-gray-500">
        Loading ticket...
        </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h1 className="text-2xl font-bold">{ticket.title}</h1>
        <p className="text-gray-500">{ticket.ticket_id}</p>

        <div className="flex gap-2 mt-3">
          <span className="badge bg-blue-600">{ticket.status}</span>
          <span className="badge bg-red-500">{ticket.priority}</span>
        </div>
      </div>

      {/* ATTACHMENTS */}
      <div className="card">
        <h2 className="title">
          <FaPaperclip /> Attachments ({ticket.attachments?.length || 0})
        </h2>

        {ticket.attachments?.map((a) => (
          <div key={a.id} className="item">

            <a href={a.file} target="_blank" rel="noreferrer" className="link">
              View Attachment
            </a>

            <div className="relative">
              {(user?.role === "admin" || a.uploaded_by === user?.id) && (
                <FaEllipsisV
                  onClick={() => setAttachmentMenu(a.id)}
                  className="cursor-pointer text-gray-600"
                />
              )}

              {attachmentMenu === a.id && (
                <div className="menu">
                  <button onClick={() => setEditAttachment(a.id)}>Edit</button>
                  <button onClick={() => deleteAttachment(a.id)}>Delete</button>
                </div>
              )}
            </div>

            {editAttachment === a.id && (
              <div className="mt-2">
                <input
                  type="file"
                  onChange={(e) => setEditAttachmentFile(e.target.files[0])}
                />
                <button
                  onClick={() => saveAttachmentEdit(a.id)}
                  className="btn-primary mt-2"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* COMMENTS */}
      <div className="card">
        <h2 className="title">
          <FaCommentDots /> Comments ({ticket.comments?.length || 0})
        </h2>

        {ticket.comments?.slice(0, visibleComments).map((c) => (
          <div key={c.id} className="border-b pb-3 mt-3">

            <div className="flex gap-2 items-center">
              <FaUserCircle />
              <div className="ml-2">
                <p>{c.user}</p>
                <p className="text-xs">
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </div>

              <div className="ml-auto relative">
                {(user?.role === "admin" || c.user === user?.username) ? (
                  <FaEllipsisV
                    onClick={() => setCommentMenu(c.id)}
                    className="cursor-pointer"
                  />
                ): null}

                {commentMenu === c.id && (
                  <div className="menu">
                    <button onClick={() => handleEditComment(c)}>Edit</button>
                    <button onClick={() => deleteComment(c.id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>

            {editComment === c.id ? (
              <div className="mt-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="input"
                />

                <input
                  type="file"
                  onChange={(e) => setEditFile(e.target.files[0])}
                />

                <button
                  onClick={() => saveEditComment(c.id)}
                  className="btn-primary mt-2"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="bg-gray-100 p-3 rounded mt-2 text-sm">
                {/* TEXT */}
                {c.comment && <p>{c.comment}</p>}
                {/* ATTACHMENT */}
                {c.attachment_url && (
                  <a
                    href={c.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline block"
                  >
                    📎 {c.attachment_url.split("/").pop()}
                  </a>
                )}
              </div>
            )}
          </div>
        ))}

        {visibleComments < (ticket.comments?.length || 0) && (
          <button
            onClick={() => setVisibleComments((p) => p + 3)}
            className="text-blue-600 mt-3"
          >
            Load more...
          </button>
        )}

        <div className="mt-4 border-t pt-3">
          <textarea
            placeholder="Add comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input"
          />

          <div className="flex justify-between mt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button onClick={handleAddComment} className="btn-primary">
              Post
            </button>
          </div>
        </div>
      </div>

      {/* INFO */}
      <div className="card">
        <h2 className="title">
          <FaInfoCircle /> Ticket Info
        </h2>

        <div className="grid md:grid-cols-2 gap-3 text-sm mt-3">
          <p><b>Created:</b> {new Date(ticket.created_at).toLocaleString()}</p>
          <p><b>Updated:</b> {new Date(ticket.updated_at).toLocaleString()}</p>
          <p><b>Department:</b> {ticket.department || "-"}</p>
          <p><b>Client:</b> {ticket.client || "-"}</p>
          <p><b>Created By:</b> {ticket.created_by || "-"}</p>
          {user.role !== "employee" && (
          <p>
            <b>Assigned To:</b>{" "}
            {ticket.assigned_to
              ? users.find(u => u.id === ticket.assigned_to)?.username || "Unknown User"
              : "Unassigned"}
          </p>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      
      <div className="card p-6 shadow-lg rounded-xl bg-white">
        <h2 className="title flex items-center gap-2 text-xl font-semibold mb-4">
          <FaTasks /> Actions
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Column 1: Ticket Actions */}
          <div className="flex flex-col gap-4">
            {user.role !== "employee" && (
              <>
                {/* Edit & Delete */}
                <div className="flex flex-col md:flex-row gap-3">
                  {canEdit && (
                    <button
                      onClick={openEditModal}
                      className="btn  w-full md:w-auto"
                    >
                      Edit Ticket
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={deleteTicket}
                      className="btn bg-red-500 hover:bg-red-600 text-dark w-full md:w-auto"
                    >
                      Delete Ticket
                    </button>
                  )}
                </div>

                {/* View History */}
                <button
                  onClick={() => navigate(`/tickets/${ticket.id}/history`)}
                  className="btn bg-blue-600 hover:bg-blue-700 text-dark w-full md:w-auto"
                >
                  View Ticket History
                </button>
              </>
            )}

            {/* Close/Reopen Ticket (for all users) */}
            {ticket && (
              <button
                onClick={ticket.status !== "closed" ? closeTicket : reopenTicket}
                className={`btn w-full md:w-auto ${
                  ticket.status !== "closed"
                    ? "bg-red-500 hover:bg-red-600 text-dark"
                    : "bg-blue-500 hover:bg-blue-600 text-dark"
                }`}
              >
                {ticket.status !== "closed" ? "Close Ticket" : "Reopen Ticket"}
              </button>
            )}
          </div>

          {/* Column 2: Assign Ticket */}
          {(isAdmin || isManager || isTeamLead) && (
            <div className="mt-0 p-4 border rounded-lg bg-gray-50">
              <label className="text-sm font-medium block mb-2">
                Assign Ticket
              </label>

              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="input w-full mb-3"
              >
                <option value="">Select user</option>
                {getAssignableUsers().map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.role})
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-3">
                <button onClick={assignTicket} className="btn  w-full md:w-auto">
                  Assign
                </button>

                {ticket.assigned_to &&
                  ticket.assigned_by &&
                  ticket.assigned_by.id === user?.id && (
                    <button onClick={unassignTicket} className="btn btn-secondary w-full md:w-auto">
                      Unassign
                    </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* EDIT Ticket MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Ticket</h2>

            {/* TITLE */}
            <input
              type="text"
              placeholder="Title"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className="input mb-3"
            />

            {/* DESCRIPTION */}
            <textarea
              placeholder="Description"
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="input mb-3"
            />

            {/* STATUS */}
            {canChangeStatus && (
              <div className="mb-3">
                <label className="text-sm font-medium block mb-1">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="input"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* PRIORITY */}
            {canChangePriority && (
              <div className="mb-3">
                <label className="text-sm font-medium block mb-1">
                  Priority
                </label>
                <select
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm({ ...editForm, priority: e.target.value })
                  }
                  className="input"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn"
              >
                Cancel
              </button>

              <button
                onClick={saveEditTicket}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showCommentEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">

            <h2 className="text-lg font-semibold mb-3">Edit Comment</h2>

            {/* TEXT */}
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="input mb-3"
            />

            {/* EXISTING FILE */}
            {editingComment?.attachment_url && (
              <a
                href={editingComment.attachment_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline block mb-2"
              >
                Current: {editingComment.attachment_url.split("/").pop()}
              </a>
            )}

            {/* NEW FILE */}
            <input
              type="file"
              onChange={(e) => setEditFile(e.target.files[0])}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCommentEditModal(false)}
                className="btn"
              >
                Cancel
              </button>

              <button
                onClick={() => saveEditComment(editingComment.id)}
                className="btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;