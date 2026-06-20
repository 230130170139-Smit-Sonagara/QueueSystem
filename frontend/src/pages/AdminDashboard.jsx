import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Building,
  Cable,
  ClipboardList,
  GitBranch,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRoundPlus,
  Users,
  Waypoints,
  X,
} from 'lucide-react';
import api, { clearSession } from '../api';

const emptyMessage = { type: '', text: '' };
const actionLabels = {
  organization: 'New Organization',
  branch: 'New Branch',
  department: 'New Department',
  queue: 'New Queue',
  counter: 'New Counter',
  agent: 'New Agent',
  assignment: 'Assign Agent',
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [setup, setSetup] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [message, setMessage] = useState(emptyMessage);
  const [loadingAction, setLoadingAction] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [activeSection, setActiveSection] = useState('branches');
  const [activeAction, setActiveAction] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();

  const [organizationForm, setOrganizationForm] = useState({ name: '', code: '', contactEmail: '', description: '' });
  const [branchForm, setBranchForm] = useState({ organizationId: '', name: '', location: '', timezone: 'Asia/Kolkata', supportEmail: '', contactNumber: '' });
  const [departmentForm, setDepartmentForm] = useState({ branchId: '', name: '' });
  const [queueForm, setQueueForm] = useState({ branchId: '', departmentId: '', name: '', serviceCode: '', prefix: '', description: '', averageServiceTimeMinutes: 5 });
  const [counterForm, setCounterForm] = useState({ branchId: '', departmentId: '', name: '', code: '' });
  const [agentForm, setAgentForm] = useState({ branchId: '', counterId: '', username: '', password: 'Mayur@2006', fullName: '', email: '', phone: '' });
  const [assignmentForm, setAssignmentForm] = useState({ counterId: '', agentId: '' });

  const refreshData = async () => {
    const [dashboardResponse, setupResponse, catalogResponse] = await Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/setup'),
      api.get('/admin/catalog'),
    ]);
    setDashboard(dashboardResponse.data);
    setSetup(setupResponse.data);
    setCatalog(catalogResponse.data);
  };

  useEffect(() => {
    refreshData().catch(() => {
      clearSession();
      navigate('/login');
    });
  }, [navigate]);

  useEffect(() => {
    if (catalog?.organizations?.length && !selectedOrganizationId) {
      setSelectedOrganizationId(String(catalog.organizations[0].id));
    }
  }, [catalog, selectedOrganizationId]);

  const selectedOrganization = useMemo(
    () => (catalog?.organizations || []).find((organization) => String(organization.id) === selectedOrganizationId) || null,
    [catalog, selectedOrganizationId],
  );

  const filteredBranches = useMemo(
    () => (catalog?.branches || []).filter((branch) => !selectedOrganizationId || String(branch.organizationId) === selectedOrganizationId),
    [catalog, selectedOrganizationId],
  );

  useEffect(() => {
    if (!filteredBranches.length) {
      setSelectedBranchId('');
      return;
    }

    if (!filteredBranches.some((branch) => String(branch.id) === selectedBranchId)) {
      setSelectedBranchId(String(filteredBranches[0].id));
    }
  }, [filteredBranches, selectedBranchId]);

  const selectedBranch = useMemo(
    () => filteredBranches.find((branch) => String(branch.id) === selectedBranchId) || null,
    [filteredBranches, selectedBranchId],
  );

  const branchIds = useMemo(
    () => new Set((selectedBranch ? [selectedBranch] : filteredBranches).map((branch) => branch.id)),
    [filteredBranches, selectedBranch],
  );

  const filteredDepartments = useMemo(
    () => (catalog?.departments || []).filter((department) => branchIds.has(department.branchId)),
    [catalog, branchIds],
  );

  const filteredCounters = useMemo(
    () => (catalog?.counters || []).filter((counter) => branchIds.has(counter.branchId)),
    [catalog, branchIds],
  );

  const filteredAgents = useMemo(
    () => (catalog?.agents || []).filter((agent) => branchIds.has(agent.branchId)),
    [catalog, branchIds],
  );

  const filteredQueues = useMemo(
    () => (catalog?.queues || []).filter((queue) => branchIds.has(queue.branchId)),
    [catalog, branchIds],
  );

  const filteredLiveServing = useMemo(
    () => (dashboard?.liveServing || []).filter((item) => !selectedBranchId || String(item.branchId) === selectedBranchId),
    [dashboard, selectedBranchId],
  );

  useEffect(() => {
    if (!catalog) {
      return;
    }

    const firstBranchId = filteredBranches[0]?.id ? String(filteredBranches[0].id) : '';
    const firstDepartmentId = filteredDepartments[0]?.id ? String(filteredDepartments[0].id) : '';
    const firstCounterId = filteredCounters[0]?.id ? String(filteredCounters[0].id) : '';
    const firstAgentId = filteredAgents[0]?.id ? String(filteredAgents[0].id) : '';

    setBranchForm((current) => ({ ...current, organizationId: current.organizationId || selectedOrganizationId }));
    setDepartmentForm((current) => ({ ...current, branchId: current.branchId || firstBranchId }));
    setQueueForm((current) => ({ ...current, branchId: current.branchId || firstBranchId, departmentId: current.departmentId || firstDepartmentId }));
    setCounterForm((current) => ({ ...current, branchId: current.branchId || firstBranchId, departmentId: current.departmentId || firstDepartmentId }));
    setAgentForm((current) => ({ ...current, branchId: current.branchId || firstBranchId, counterId: current.counterId || firstCounterId }));
    setAssignmentForm((current) => ({ ...current, counterId: current.counterId || firstCounterId, agentId: current.agentId || firstAgentId }));
  }, [catalog, filteredBranches, filteredDepartments, filteredCounters, filteredAgents, selectedOrganizationId]);

  const queueDepartments = filteredDepartments.filter((department) => String(department.branchId) === queueForm.branchId);
  const counterDepartments = filteredDepartments.filter((department) => String(department.branchId) === counterForm.branchId);
  const branchCounters = filteredCounters.filter((counter) => String(counter.branchId) === agentForm.branchId);
  const assignableAgents = filteredAgents.filter((agent) => {
    const selectedCounter = filteredCounters.find((counter) => String(counter.id) === assignmentForm.counterId);
    return !selectedCounter || String(agent.branchId) === String(selectedCounter.branchId);
  });

  const runAdminAction = async (request, onSuccess) => {
    setLoadingAction(true);
    setMessage(emptyMessage);
    try {
      await request();
      await refreshData();
      onSuccess?.();
      setMessage({ type: 'success', text: 'Changes saved successfully.' });
      setActiveAction('');
      setEditingItem(null);
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'The admin action could not be completed.' });
    } finally {
      setLoadingAction(false);
    }
  };

  const runDeleteAction = async (label, request) => {
    if (!window.confirm(`Delete ${label}? This will remove related setup data.`)) {
      return;
    }
    await runAdminAction(request);
  };

  const openCreateAction = (actionKey) => {
    setEditingItem(null);
    setActiveAction(actionKey);
  };

  const openEditAction = (actionKey, item) => {
    setEditingItem(item);
    setActiveAction(actionKey);

    if (actionKey === 'organization') {
      setOrganizationForm({
        name: item.name || '',
        code: item.code || '',
        contactEmail: item.contactEmail || '',
        description: item.description || '',
      });
    }

    if (actionKey === 'branch') {
      setBranchForm({
        organizationId: String(item.organizationId),
        name: item.name || '',
        location: item.location || '',
        timezone: item.timezone || 'Asia/Kolkata',
        supportEmail: item.supportEmail || '',
        contactNumber: item.contactNumber || '',
      });
    }

    if (actionKey === 'department') {
      setDepartmentForm({
        branchId: String(item.branchId),
        name: item.name || '',
      });
    }

    if (actionKey === 'queue') {
      const departmentId = filteredDepartments.find((department) => department.name === item.departmentName && department.branchId === item.branchId)?.id || '';
      setQueueForm({
        branchId: String(item.branchId),
        departmentId: String(departmentId),
        name: item.name || '',
        serviceCode: item.serviceCode || '',
        prefix: item.prefix || '',
        description: item.description || '',
        averageServiceTimeMinutes: item.averageServiceTimeMinutes || 5,
      });
    }

    if (actionKey === 'counter') {
      setCounterForm({
        branchId: String(item.branchId),
        departmentId: String(item.departmentId || ''),
        name: item.name || '',
        code: item.code || '',
      });
    }

    if (actionKey === 'agent') {
      setAgentForm({
        branchId: String(item.branchId),
        counterId: String(item.counterId || ''),
        username: item.username || '',
        password: '',
        fullName: item.fullName || '',
        email: item.email || '',
        phone: item.phone || '',
      });
    }
  };

  const actionCards = [
    { key: 'organization', title: 'Create organization', description: 'Add a new business network with its own branches and setup.', icon: Waypoints },
    { key: 'branch', title: 'Create branch', description: 'Open a new office location under the selected organization.', icon: GitBranch },
    { key: 'department', title: 'Create department', description: 'Add a service section such as billing, diagnostics, or support.', icon: Cable },
    { key: 'queue', title: 'Create queue', description: 'Define a public-facing queue with its code, prefix, and timing.', icon: ClipboardList },
    { key: 'counter', title: 'Create counter', description: 'Add a service desk that can call and complete tokens.', icon: Building },
    { key: 'agent', title: 'Create agent', description: 'Create a staff account and assign it directly to a counter.', icon: UserRoundPlus },
    { key: 'assignment', title: 'Assign agent', description: 'Reassign an existing agent to another counter within the same branch.', icon: Users },
  ];

  const sectionTabs = [
    { key: 'branches', label: 'Branches' },
    { key: 'departments', label: 'Departments' },
    { key: 'queues', label: 'Queues' },
    { key: 'counters', label: 'Counters' },
    { key: 'agents', label: 'Agents' },
    { key: 'live', label: 'Live Serving' },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#172554_45%,#0f172a_100%)] px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Admin Control Workspace</p>
            <h1 className="mt-2 text-4xl font-black text-white">{selectedOrganization?.name || setup?.organizationName || 'Smart Queue Network'}</h1>
            <p className="mt-2 text-slate-300">Manage organizations, branches, departments, queues, counters, and agent assignments from one place.</p>
          </div>
          <button
            onClick={() => {
              clearSession();
              navigate('/login');
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            <LogOut className="mr-2 inline h-4 w-4" /> Logout
          </button>
        </div>

        {message.text && (
          <div className={`mb-6 rounded-[1.5rem] border px-5 py-4 text-sm font-medium ${
            message.type === 'error'
              ? 'border-rose-300/20 bg-rose-300/10 text-rose-100'
              : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[0.78fr,1.22fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-sky-300" />
                <h2 className="text-2xl font-bold text-white">Organizations</h2>
              </div>
              <div className="mt-5 space-y-3">
                {(catalog?.organizations || []).map((organization) => (
                  <div
                    key={organization.id}
                    className={`rounded-[1.4rem] border px-4 py-4 transition ${
                      String(organization.id) === selectedOrganizationId
                        ? 'border-sky-300/40 bg-sky-300/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedOrganizationId(String(organization.id))}
                        className="flex-1 text-left"
                      >
                        <p className="text-lg font-bold text-white">{organization.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{organization.code}</p>
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-200">
                          {organization.branchCount} branches
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditAction('organization', organization)}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => runDeleteAction(`organization \"${organization.name}\"`, () => api.delete(`/admin/organizations/${organization.id}`))}
                          className="rounded-full border border-rose-300/20 bg-rose-300/10 p-2 text-rose-200 transition hover:bg-rose-300/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(dashboard?.metrics || []).map((metric) => (
                <div key={metric.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
                  <p className="mt-3 text-3xl font-black text-white">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{metric.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Setup Actions</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Administration Studio</h2>
                </div>
                <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">
                  Active organization: <span className="font-semibold text-white">{selectedOrganization?.name || 'Select one'}</span>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {actionCards.map(({ key, title, description, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => openCreateAction(key)}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-left transition hover:-translate-y-0.5 hover:bg-white/10"
                  >
                    <div className="inline-flex rounded-2xl bg-sky-500/15 p-3 text-sky-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-lg font-bold text-white">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Branch Focus</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{selectedBranch?.name || 'Select a branch'}</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {selectedBranch
                      ? `${selectedBranch.location || 'No location'} | ${selectedBranch.queueCount} queues | ${selectedBranch.counterCount} counters`
                      : 'Choose one branch to see only its related departments, queues, counters, agents, and live serving.'}
                  </p>
                </div>
                <div className="w-full max-w-sm">
                  <SelectField
                    label="Branch"
                    value={selectedBranchId}
                    onChange={setSelectedBranchId}
                    options={filteredBranches.map((branch) => ({ value: String(branch.id), label: branch.name }))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {sectionTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveSection(tab.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeSection === tab.key
                        ? 'bg-sky-500 text-white'
                        : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {activeSection === 'branches' && (
                  <EntityBoard title="Branches" icon={GitBranch} tone="text-violet-300" items={selectedBranch ? [selectedBranch] : []} renderItem={(branch) => (
                    <EntityRow
                      key={branch.id}
                      title={branch.name}
                      subtitle={`${branch.location || 'No location'} | ${branch.queueCount} queues | ${branch.counterCount} counters`}
                      meta={branch.supportEmail || branch.timezone}
                      onEdit={() => openEditAction('branch', branch)}
                      onDelete={() => runDeleteAction(`branch \"${branch.name}\"`, () => api.delete(`/admin/branches/${branch.id}`))}
                    />
                  )} />
                )}

                {activeSection === 'departments' && (
                  <EntityBoard title="Departments" icon={Cable} tone="text-emerald-300" items={filteredDepartments} renderItem={(department) => (
                    <EntityRow
                      key={department.id}
                      title={department.name}
                      subtitle={`${department.branchName} | ${department.queueCount} queues | ${department.counterCount} counters`}
                      onEdit={() => openEditAction('department', department)}
                      onDelete={() => runDeleteAction(`department \"${department.name}\"`, () => api.delete(`/admin/departments/${department.id}`))}
                    />
                  )} />
                )}

                {activeSection === 'queues' && (
                  <EntityBoard title="Queues" icon={ClipboardList} tone="text-amber-300" items={filteredQueues} renderItem={(queue) => (
                    <EntityRow
                      key={queue.id}
                      title={queue.name}
                      subtitle={`${queue.departmentName} | ${queue.serviceCode} | ${queue.waitingCount} waiting`}
                      meta={`${queue.averageServiceTimeMinutes} min avg`}
                      onEdit={() => openEditAction('queue', queue)}
                      onDelete={() => runDeleteAction(`queue \"${queue.name}\"`, () => api.delete(`/admin/queues/${queue.id}`))}
                    />
                  )} />
                )}

                {activeSection === 'counters' && (
                  <EntityBoard title="Counters" icon={Building} tone="text-pink-300" items={filteredCounters} renderItem={(counter) => (
                    <EntityRow
                      key={counter.id}
                      title={`${counter.name} (${counter.code})`}
                      subtitle={`${counter.departmentName || 'No department'} | ${counter.branchName}`}
                      meta={counter.currentAgentName || 'Unassigned'}
                      onEdit={() => openEditAction('counter', counter)}
                      onDelete={() => runDeleteAction(`counter \"${counter.name}\"`, () => api.delete(`/admin/counters/${counter.id}`))}
                    />
                  )} />
                )}

                {activeSection === 'agents' && (
                  <EntityBoard title="Agents" icon={Users} tone="text-sky-300" items={filteredAgents} renderItem={(agent) => (
                    <EntityRow
                      key={agent.id}
                      title={agent.fullName}
                      subtitle={`${agent.username} | ${agent.branchName}`}
                      meta={agent.counterName || 'No counter assigned'}
                      onEdit={() => openEditAction('agent', agent)}
                      onDelete={() => runDeleteAction(`agent \"${agent.fullName}\"`, () => api.delete(`/admin/agents/${agent.id}`))}
                    />
                  )} />
                )}

                {activeSection === 'live' && (
                  <EntityBoard title="Live Serving" icon={ShieldCheck} tone="text-lime-300" items={filteredLiveServing} renderItem={(item) => (
                    <div key={item.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-lg font-bold text-white">{item.tokenIdentifier}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.queueName}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-emerald-300">{item.counterName}</p>
                    </div>
                  )} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeAction && (
        <ActionModal title={`${editingItem ? 'Edit' : 'Create'} ${actionLabels[activeAction].replace('New ', '')}`} onClose={() => { setActiveAction(''); setEditingItem(null); }}>
          {activeAction === 'organization' && (
            <div className="space-y-4">
              <ModalGrid>
                <TextField label="Organization Name" value={organizationForm.name} onChange={(value) => setOrganizationForm({ ...organizationForm, name: value })} />
                <TextField label="Organization Code" value={organizationForm.code} onChange={(value) => setOrganizationForm({ ...organizationForm, code: value })} />
                <TextField label="Contact Email" value={organizationForm.contactEmail} onChange={(value) => setOrganizationForm({ ...organizationForm, contactEmail: value })} />
                <TextField label="Description" value={organizationForm.description} onChange={(value) => setOrganizationForm({ ...organizationForm, description: value })} />
              </ModalGrid>
              <PrimaryButton disabled={loadingAction} onClick={() => runAdminAction(() => editingItem ? api.put(`/admin/organizations/${editingItem.id}`, organizationForm) : api.post('/admin/organizations', organizationForm), () => setOrganizationForm({ name: '', code: '', contactEmail: '', description: '' }))}>
                {editingItem ? 'Update Organization' : 'Save Organization'}
              </PrimaryButton>
            </div>
          )}

          {activeAction === 'branch' && (
            <div className="space-y-4">
              <ModalGrid>
                <SelectField label="Organization" value={branchForm.organizationId || selectedOrganizationId} onChange={(value) => setBranchForm({ ...branchForm, organizationId: value })} options={(catalog?.organizations || []).map((organization) => ({ value: String(organization.id), label: organization.name }))} />
                <TextField label="Branch Name" value={branchForm.name} onChange={(value) => setBranchForm({ ...branchForm, name: value })} />
                <TextField label="Location" value={branchForm.location} onChange={(value) => setBranchForm({ ...branchForm, location: value })} />
                <TextField label="Timezone" value={branchForm.timezone} onChange={(value) => setBranchForm({ ...branchForm, timezone: value })} />
                <TextField label="Support Email" value={branchForm.supportEmail} onChange={(value) => setBranchForm({ ...branchForm, supportEmail: value })} />
                <TextField label="Contact Number" value={branchForm.contactNumber} onChange={(value) => setBranchForm({ ...branchForm, contactNumber: value })} />
              </ModalGrid>
              <PrimaryButton disabled={loadingAction || !(branchForm.organizationId || selectedOrganizationId)} onClick={() => runAdminAction(() => editingItem ? api.put(`/admin/branches/${editingItem.id}`, { ...branchForm, organizationId: Number(branchForm.organizationId || selectedOrganizationId) }) : api.post('/admin/branches', { ...branchForm, organizationId: Number(branchForm.organizationId || selectedOrganizationId) }), () => setBranchForm({ organizationId: selectedOrganizationId, name: '', location: '', timezone: 'Asia/Kolkata', supportEmail: '', contactNumber: '' }))}>
                {editingItem ? 'Update Branch' : 'Save Branch'}
              </PrimaryButton>
            </div>
          )}

          {activeAction === 'department' && (
            <div className="space-y-4">
              <ModalGrid>
                <SelectField label="Branch" value={departmentForm.branchId} onChange={(value) => setDepartmentForm({ ...departmentForm, branchId: value })} options={filteredBranches.map((branch) => ({ value: String(branch.id), label: branch.name }))} />
                <TextField label="Department Name" value={departmentForm.name} onChange={(value) => setDepartmentForm({ ...departmentForm, name: value })} />
              </ModalGrid>
              <PrimaryButton disabled={loadingAction || !departmentForm.branchId} onClick={() => runAdminAction(() => editingItem ? api.put(`/admin/departments/${editingItem.id}`, { ...departmentForm, branchId: Number(departmentForm.branchId) }) : api.post('/admin/departments', { ...departmentForm, branchId: Number(departmentForm.branchId) }), () => setDepartmentForm({ branchId: filteredBranches[0]?.id ? String(filteredBranches[0].id) : '', name: '' }))}>
                {editingItem ? 'Update Department' : 'Save Department'}
              </PrimaryButton>
            </div>
          )}

          {activeAction === 'queue' && (
            <div className="space-y-4">
              <ModalGrid>
                <SelectField label="Branch" value={queueForm.branchId} onChange={(value) => setQueueForm({ ...queueForm, branchId: value, departmentId: '' })} options={filteredBranches.map((branch) => ({ value: String(branch.id), label: branch.name }))} />
                <SelectField label="Department" value={queueForm.departmentId} onChange={(value) => setQueueForm({ ...queueForm, departmentId: value })} options={queueDepartments.map((department) => ({ value: String(department.id), label: department.name }))} />
                <TextField label="Queue Name" value={queueForm.name} onChange={(value) => setQueueForm({ ...queueForm, name: value })} />
                <TextField label="Service Code" value={queueForm.serviceCode} onChange={(value) => setQueueForm({ ...queueForm, serviceCode: value })} />
                <TextField label="Prefix" value={queueForm.prefix} onChange={(value) => setQueueForm({ ...queueForm, prefix: value })} />
                <TextField label="Average Minutes" type="number" value={queueForm.averageServiceTimeMinutes} onChange={(value) => setQueueForm({ ...queueForm, averageServiceTimeMinutes: Number(value) || 0 })} />
              </ModalGrid>
              <TextAreaField label="Description" value={queueForm.description} onChange={(value) => setQueueForm({ ...queueForm, description: value })} />
              <PrimaryButton disabled={loadingAction || !queueForm.branchId || !queueForm.departmentId} onClick={() => runAdminAction(() => editingItem ? api.put(`/admin/queues/${editingItem.id}`, { ...queueForm, branchId: Number(queueForm.branchId), departmentId: Number(queueForm.departmentId) }) : api.post('/admin/queues', { ...queueForm, branchId: Number(queueForm.branchId), departmentId: Number(queueForm.departmentId) }), () => setQueueForm({ branchId: filteredBranches[0]?.id ? String(filteredBranches[0].id) : '', departmentId: '', name: '', serviceCode: '', prefix: '', description: '', averageServiceTimeMinutes: 5 }))}>
                {editingItem ? 'Update Queue' : 'Save Queue'}
              </PrimaryButton>
            </div>
          )}

          {activeAction === 'counter' && (
            <div className="space-y-4">
              <ModalGrid>
                <SelectField label="Branch" value={counterForm.branchId} onChange={(value) => setCounterForm({ ...counterForm, branchId: value, departmentId: '' })} options={filteredBranches.map((branch) => ({ value: String(branch.id), label: branch.name }))} />
                <SelectField label="Department" value={counterForm.departmentId} onChange={(value) => setCounterForm({ ...counterForm, departmentId: value })} options={counterDepartments.map((department) => ({ value: String(department.id), label: department.name }))} />
                <TextField label="Counter Name" value={counterForm.name} onChange={(value) => setCounterForm({ ...counterForm, name: value })} />
                <TextField label="Counter Code" value={counterForm.code} onChange={(value) => setCounterForm({ ...counterForm, code: value })} />
              </ModalGrid>
              <PrimaryButton disabled={loadingAction || !counterForm.branchId || !counterForm.departmentId} onClick={() => runAdminAction(() => editingItem ? api.put(`/admin/counters/${editingItem.id}`, { ...counterForm, branchId: Number(counterForm.branchId), departmentId: Number(counterForm.departmentId) }) : api.post('/admin/counters', { ...counterForm, branchId: Number(counterForm.branchId), departmentId: Number(counterForm.departmentId) }), () => setCounterForm({ branchId: filteredBranches[0]?.id ? String(filteredBranches[0].id) : '', departmentId: '', name: '', code: '' }))}>
                {editingItem ? 'Update Counter' : 'Save Counter'}
              </PrimaryButton>
            </div>
          )}

          {activeAction === 'agent' && (
            <div className="space-y-4">
              <ModalGrid>
                <SelectField label="Branch" value={agentForm.branchId} onChange={(value) => setAgentForm({ ...agentForm, branchId: value, counterId: '' })} options={filteredBranches.map((branch) => ({ value: String(branch.id), label: branch.name }))} />
                <SelectField label="Counter" value={agentForm.counterId} onChange={(value) => setAgentForm({ ...agentForm, counterId: value })} options={branchCounters.map((counter) => ({ value: String(counter.id), label: `${counter.name} (${counter.code})` }))} />
                <TextField label="Full Name" value={agentForm.fullName} onChange={(value) => setAgentForm({ ...agentForm, fullName: value })} />
                <TextField label="Username" value={agentForm.username} onChange={(value) => setAgentForm({ ...agentForm, username: value })} />
                <TextField label="Email" value={agentForm.email} onChange={(value) => setAgentForm({ ...agentForm, email: value })} />
                <TextField label="Phone" value={agentForm.phone} onChange={(value) => setAgentForm({ ...agentForm, phone: value })} />
                <TextField label="Password" value={agentForm.password} onChange={(value) => setAgentForm({ ...agentForm, password: value })} />
              </ModalGrid>
              <PrimaryButton disabled={loadingAction || !agentForm.branchId || !agentForm.counterId} onClick={() => runAdminAction(() => editingItem ? api.put(`/admin/agents/${editingItem.id}`, { ...agentForm, branchId: Number(agentForm.branchId), counterId: Number(agentForm.counterId), emailNotificationsEnabled: true }) : api.post('/admin/agents', { ...agentForm, branchId: Number(agentForm.branchId), counterId: Number(agentForm.counterId), emailNotificationsEnabled: true }), () => setAgentForm({ branchId: filteredBranches[0]?.id ? String(filteredBranches[0].id) : '', counterId: '', username: '', password: 'Mayur@2006', fullName: '', email: '', phone: '' }))}>
                {editingItem ? 'Update Agent' : 'Save Agent'}
              </PrimaryButton>
            </div>
          )}

          {activeAction === 'assignment' && (
            <div className="space-y-4">
              <ModalGrid>
                <SelectField label="Counter" value={assignmentForm.counterId} onChange={(value) => setAssignmentForm({ ...assignmentForm, counterId: value, agentId: '' })} options={filteredCounters.map((counter) => ({ value: String(counter.id), label: `${counter.name} (${counter.code})` }))} />
                <SelectField label="Agent" value={assignmentForm.agentId} onChange={(value) => setAssignmentForm({ ...assignmentForm, agentId: value })} options={assignableAgents.map((agent) => ({ value: String(agent.id), label: `${agent.fullName} (${agent.username})` }))} />
              </ModalGrid>
              <PrimaryButton disabled={loadingAction || !assignmentForm.counterId || !assignmentForm.agentId} onClick={() => runAdminAction(() => api.post(`/admin/counters/${assignmentForm.counterId}/assign-agent`, { agentId: Number(assignmentForm.agentId) }))}>
                Save Assignment
              </PrimaryButton>
            </div>
          )}
        </ActionModal>
      )}
    </div>
  );
}

function EntityBoard({ title, icon: Icon, tone, items, renderItem }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
      <div className="flex items-center gap-3">
        <Icon className={`h-6 w-6 ${tone}`} />
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="mt-5 space-y-3">
        {items?.length ? items.map(renderItem) : <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5 text-slate-300">No records available.</div>}
      </div>
    </div>
  );
}

function EntityRow({ title, subtitle, meta, onEdit, onDelete }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4">
      <div>
        <p className="text-lg font-bold text-white">{title}</p>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        {meta && <p className="mt-3 text-xs uppercase tracking-[0.18em] text-sky-300">{meta}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onEdit} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10">
          <Pencil className="h-4 w-4" />
        </button>
        <button type="button" onClick={onDelete} className="rounded-full border border-rose-300/20 bg-rose-300/10 p-2 text-rose-200 transition hover:bg-rose-300/20">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ActionModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-[#081126] p-6 shadow-2xl shadow-black/40">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Admin Action</p>
            <h2 className="mt-2 text-3xl font-black text-white">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-300 transition hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalGrid({ children }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function TextField({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400" />
    </label>
  );
}

function TextAreaField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400" />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400">
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function PrimaryButton({ disabled, onClick, children }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="inline-flex items-center rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 font-bold text-white transition disabled:opacity-60">
      <Plus className="mr-2 h-4 w-4" />
      {children}
    </button>
  );
}
