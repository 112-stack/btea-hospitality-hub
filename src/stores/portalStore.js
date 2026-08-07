import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getOfficialService } from '../data/officialServices';

const seedApplications = [
  {
    id: 'BTEA-26-1042',
    serviceId: '2',
    propertyId: '75dd54e4-bb1d-e711-993f-000c290e9127',
    title: 'Q2 Tourism Levy',
    status: 'Action required',
    stage: 2,
    createdAt: '2026-07-29T09:30:00.000Z',
    updatedAt: '2026-08-06T14:20:00.000Z',
    dueDate: '2026-08-15',
    documents: [
      { id: 'DOC-1', name: 'Q2-signed-levy-form.pdf', status: 'Accepted', uploadedAt: '2026-08-01T10:15:00.000Z' },
    ],
    note: 'Confirm the declared room nights before continuing to payment.',
  },
  {
    id: 'BTEA-26-1038',
    serviceId: '1',
    propertyId: '75dd54e4-bb1d-e711-993f-000c290e9127',
    title: '2027 Tourism License Renewal',
    status: 'Under review',
    stage: 3,
    createdAt: '2026-07-18T08:00:00.000Z',
    updatedAt: '2026-08-04T11:40:00.000Z',
    dueDate: '2027-04-09',
    documents: [],
    note: 'Specialist review is in progress. No action is required.',
  },
  {
    id: 'BTEA-26-1027',
    serviceId: '8',
    propertyId: '75dd54e4-bb1d-e711-993f-000c290e9127',
    title: 'Summer Stage Artist Permits',
    status: 'Draft',
    stage: 1,
    createdAt: '2026-08-03T12:00:00.000Z',
    updatedAt: '2026-08-03T12:00:00.000Z',
    dueDate: '2026-08-20',
    documents: [],
    note: 'Add the artist and venue records before submission.',
  },
];

const seedInspections = [
  {
    id: 'INSP-26-0318',
    title: 'Annual classification inspection',
    property: 'TEST HOTEL',
    date: '2026-08-19',
    window: '09:00–11:00',
    status: 'Scheduled',
    checklist: [
      { id: 'front-office', label: 'Front-office records available', complete: true },
      { id: 'rooms', label: 'Sample rooms ready for review', complete: true },
      { id: 'safety', label: 'Safety certificates uploaded', complete: false },
      { id: 'outlets', label: 'Outlet list matches the property record', complete: false },
      { id: 'accessibility', label: 'Accessible guest route verified', complete: false },
    ],
  },
  {
    id: 'INSP-26-0281',
    title: 'Outlet-change verification',
    property: 'TEST HOTEL',
    date: '2026-07-12',
    window: 'Completed',
    status: 'Passed',
    checklist: [
      { id: 'photos', label: 'Outlet photographs reviewed', complete: true },
      { id: 'manager', label: 'Manager record verified', complete: true },
      { id: 'pos', label: 'POS integration confirmed', complete: true },
    ],
  },
];

const seedPayments = [
  { id: 'PAY-1042', serviceId: '2', amount: 1840, date: '2026-08-02', status: 'Paid', receipt: 'RCP-26-1042' },
  { id: 'PAY-1038', serviceId: '1', amount: 1260, date: '2026-07-18', status: 'Paid', receipt: 'RCP-26-1038' },
  { id: 'PAY-1051', serviceId: '8', amount: 25, date: '2026-08-08', status: 'Ready', receipt: null },
];

const makeReference = (prefix) => {
  const fragment = globalThis.crypto?.randomUUID?.().slice(0, 8).toUpperCase() || Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}-${fragment}`;
};

const usePortalStore = create(
  persist(
    (set, get) => ({
      applications: seedApplications,
      inspections: seedInspections,
      payments: seedPayments,
      complaints: [],
      favoriteServiceIds: ['1', '2', '6'],
      language: 'en',
      fontScale: 1,
      contrast: 'standard',
      apiStatus: 'checking',
      apiMessage: 'Checking local adapter',

      setApiStatus: (apiStatus, apiMessage) => set({ apiStatus, apiMessage }),
      setLanguage: (language) => set({ language }),
      setFontScale: (fontScale) => set({ fontScale: Math.min(1.2, Math.max(0.9, fontScale)) }),
      setContrast: (contrast) => set({ contrast }),

      toggleFavorite: (serviceId) => set((state) => ({
        favoriteServiceIds: state.favoriteServiceIds.includes(serviceId)
          ? state.favoriteServiceIds.filter((id) => id !== serviceId)
          : [...state.favoriteServiceIds, serviceId],
      })),

      createApplication: (serviceId, overrides = {}) => {
        const service = getOfficialService(serviceId);
        if (!service) throw new Error('Unknown BTEA service');
        const application = {
          id: makeReference('BTEA-LOCAL'),
          serviceId: service.id,
          propertyId: '75dd54e4-bb1d-e711-993f-000c290e9127',
          title: overrides.title || service.title,
          status: 'Draft',
          stage: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueDate: overrides.dueDate || null,
          documents: [],
          note: 'Complete the readiness checklist before submitting this local working copy.',
          ...overrides,
        };
        set((state) => ({ applications: [application, ...state.applications] }));
        return application;
      },

      addApplicationDocument: (applicationId, file) => set((state) => ({
        applications: state.applications.map((application) => application.id === applicationId
          ? {
            ...application,
            updatedAt: new Date().toISOString(),
            documents: [
              ...application.documents,
              {
                id: makeReference('DOC'),
                name: file.name,
                size: file.size,
                status: 'Ready',
                uploadedAt: new Date().toISOString(),
              },
            ],
          }
          : application),
      })),

      advanceApplication: (applicationId) => set((state) => ({
        applications: state.applications.map((application) => {
          if (application.id !== applicationId) return application;
          const nextStage = Math.min(5, application.stage + 1);
          const statuses = ['Draft', 'Ready to submit', 'Under review', 'Payment', 'Completed'];
          return {
            ...application,
            stage: nextStage,
            status: statuses[nextStage - 1],
            updatedAt: new Date().toISOString(),
            note: nextStage === 5 ? 'The local demonstration workflow is complete.' : 'Application moved to the next local workflow stage.',
          };
        }),
      })),

      toggleInspectionItem: (inspectionId, itemId) => set((state) => ({
        inspections: state.inspections.map((inspection) => inspection.id === inspectionId
          ? {
            ...inspection,
            checklist: inspection.checklist.map((item) => item.id === itemId ? { ...item, complete: !item.complete } : item),
          }
          : inspection),
      })),

      addComplaint: (payload) => {
        const complaint = {
          id: makeReference('CMP'),
          status: 'Received locally',
          createdAt: new Date().toISOString(),
          ...payload,
        };
        set((state) => ({ complaints: [complaint, ...state.complaints] }));
        return complaint;
      },

      resetDemo: () => set({
        applications: seedApplications,
        inspections: seedInspections,
        payments: seedPayments,
        complaints: [],
        favoriteServiceIds: ['1', '2', '6'],
        apiStatus: 'checking',
        apiMessage: 'Checking local adapter',
      }),

      getApplication: (id) => get().applications.find((application) => application.id === id),
    }),
    {
      name: 'btea-hospitality-workspace-v3',
      version: 1,
      partialize: (state) => ({
        applications: state.applications,
        inspections: state.inspections,
        payments: state.payments,
        complaints: state.complaints,
        favoriteServiceIds: state.favoriteServiceIds,
        language: state.language,
        fontScale: state.fontScale,
        contrast: state.contrast,
      }),
    },
  ),
);

export { seedApplications, seedInspections, seedPayments };
export default usePortalStore;
