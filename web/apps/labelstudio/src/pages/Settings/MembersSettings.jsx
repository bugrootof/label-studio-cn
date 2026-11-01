import { Button, Select, Spinner, Userpic } from "@humansignal/ui";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "@humansignal/core";
import { ProjectContext } from "../../providers/ProjectProvider";
import { useAPI } from "../../providers/ApiProvider";

export const MembersSettings = () => {
  const { t } = useTranslation();
  const { project } = useContext(ProjectContext);
  const api = useAPI();

  const roleOptions = [
    { value: "annotator", label: t("Annotator") },
    { value: "reviewer", label: t("Reviewer") },
    { value: "manager", label: t("Manager") },
  ];
  const [members, setMembers] = useState(null);
  const [users, setUsers] = useState([]);
  const [newUserId, setNewUserId] = useState(null);
  const [newRole, setNewRole] = useState("annotator");

  const fetchMembers = useCallback(async () => {
    if (!project?.id) return;
    const res = await api.callApi("projectMembers", { params: { pk: project.id } });
    setMembers(res || []);
  }, [project?.id]);

  const fetchUsers = useCallback(async () => {
    const res = await api.callApi("memberships", { params: { pk: 1, page_size: 100 } });
    if (res?.results) setUsers(res.results.map(({ user }) => user));
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchUsers();
  }, [fetchMembers, fetchUsers]);

  const addMember = async () => {
    if (!newUserId) return;
    await api.callApi("addProjectMember", {
      params: { pk: project.id },
      body: { user_id: newUserId, role: newRole },
    });
    setNewUserId(null);
    fetchMembers();
  };

  const changeRole = async (memberId, role) => {
    setMembers((prev) => (prev || []).map((m) => (m.id === memberId ? { ...m, role } : m)));
    await api.callApi("updateProjectMember", {
      params: { pk: project.id, memberPk: memberId },
      body: { role },
    });
  };

  const removeMember = async (memberId) => {
    setMembers((prev) => (prev || []).filter((m) => m.id !== memberId));
    await api.callApi("deleteProjectMember", {
      params: { pk: project.id, memberPk: memberId },
    });
  };

  const memberUserIds = new Set((members || []).map((m) => m.user?.id).filter(Boolean));
  const availableUsers = users.filter((u) => !memberUserIds.has(u.id));

  return (
    <div style={{ padding: "24px 0" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{t("Members")}</h1>
      <p style={{ color: "var(--text-color-secondary, #64748b)", marginBottom: 24 }}>
        {t(
          "Control who can annotate and review tasks in this project. When members are assigned here, only those members (and the project owner) can annotate or review.",
        )}
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, maxWidth: 640 }}>
        <div style={{ flex: 1 }}>
          <Select
            value={newUserId}
            onChange={setNewUserId}
            options={availableUsers.map((u) => ({ value: u.id, label: u.email || `User ${u.id}` }))}
            placeholder={t("Select a user...")}
          />
        </div>
        <div style={{ width: 160 }}>
          <Select value={newRole} onChange={setNewRole} options={roleOptions} />
        </div>
        <Button onClick={addMember} disabled={!newUserId}>
          {t("Add Member")}
        </Button>
      </div>

      {members === null ? (
        <Spinner size={36} />
      ) : members.length === 0 ? (
        <p style={{ color: "var(--text-color-secondary, #64748b)" }}>
          {t("No members assigned. This project is currently open to all organization members.")}
        </p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 640 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>{t("User")}</th>
              <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>{t("Role")}</th>
              <th style={{ width: 100 }} />
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {member.user ? <Userpic user={member.user} style={{ width: 28, height: 28 }} /> : null}
                    {member.user?.email || t("User {{id}}", { id: member.id })}
                  </span>
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", width: 160 }}>
                  <Select value={member.role} onChange={(role) => changeRole(member.id, role)} options={roleOptions} />
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>
                  <Button look="danger" onClick={() => removeMember(member.id)}>
                    {t("Remove")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

MembersSettings.menuItem = "Members";
MembersSettings.path = "/members";
MembersSettings.exact = true;
