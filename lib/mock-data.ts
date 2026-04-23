// Static mock data — updated 2026-04-22
// 28 tasks, 4 epics, 3 sprints · deadline 15/05/2026
// Staging: https://succession-os-y6mt.vercel.app/

export const PROJECT = {
  id: 'proj-001',
  name: 'Dự án Kế nhiệm (Succession Planning)',
  description: 'Xây dựng SuccessionOS — Succession Planning SaaS cho PTSC M&C. Backend Supabase + VnR HRM integration.',
  start_date: '2026-04-20',
  end_date: '2026-05-15',
  status: 'active' as const,
  progress_percent: 40,
  staging_url: 'https://succession-os-y6mt.vercel.app/',
}

export const GOALS = [
  'UI & Backend Supabase live trên staging trước 24/04',
  'SSO VnR HRM + VnR backend migration hoàn chỉnh trước 15/05',
  'QC sign-off toàn bộ flows với user thực PTSC M&C trước 15/05',
]

export const MILESTONES = [
  { id: 'ms-1', order: 1, date: '2026-04-20', title: 'Kick-off & System Architecture',    description: 'Chốt tech stack, DB schema, phân công team, khởi động.',                   is_done: true  },
  { id: 'ms-2', order: 2, date: '2026-04-24', title: 'Sprint 1 done — Staging live',       description: 'UI Angular + Supabase backend + SSO config deploy lên Vercel.',             is_done: false },
  { id: 'ms-3', order: 3, date: '2026-05-02', title: 'SSO hoạt động + VnR mapping xong',  description: 'Auth flow VnR end-to-end OK. Ngân hoàn thành spec VnR → Supabase.',         is_done: false },
  { id: 'ms-4', order: 4, date: '2026-05-09', title: 'VnR integration 70% + QC testing',  description: 'API bridge chạy, data sync, QC bắt đầu regression test.',                   is_done: false },
  { id: 'ms-5', order: 5, date: '2026-05-15', title: '🚀 GO-LIVE — Deadline cứng 15/05', description: 'Full VnR data live, zero P1 bugs, QC sign-off, system sẵn sàng.',           is_done: false },
]

export interface TeamMember {
  id: string
  code: string
  name: string
  role: string
  color: string
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm-01', code: 'lk',   name: 'Lê Khiêm',    role: 'Full-stack & PM',      color: '#1D9E75' },
  { id: 'tm-02', code: 'ba2',  name: 'Ngân',         role: 'BA & VnR Integration', color: '#639922' },
  { id: 'tm-03', code: 'dev1', name: 'Developer 1',  role: 'SSO & Integration',    color: '#4F46E5' },
  { id: 'tm-04', code: 'qc',   name: 'QC Engineer',  role: 'QA & Testing',         color: '#EC4899' },
]

export const EPICS = [
  { id: 'ep-01', code: 'E01', name: 'UI & Frontend',         sprint_id: 'sp-1', color: '#4F46E5' },
  { id: 'ep-02', code: 'E02', name: 'Backend & Supabase',    sprint_id: 'sp-1', color: '#0EA5E9' },
  { id: 'ep-03', code: 'E03', name: 'SSO & VnR Integration', sprint_id: 'sp-2', color: '#10B981' },
  { id: 'ep-04', code: 'E04', name: 'QA & Go-live',          sprint_id: 'sp-2', color: '#F43F5E' },
]

export type SprintStatus = 'upcoming' | 'active' | 'completed' | 'outline'
export type TaskStatus   = 'todo' | 'in-progress' | 'done' | 'blocked' | 'outline'
export type TaskType     = 'spec' | 'story' | 'design' | 'dev' | 'test' | 'review' | 'doc'
export type TaskPriority = 'critical' | 'priority' | 'normal' | 'high' | 'medium' | 'low'

export interface Task {
  id: string
  sprint_id: string
  epic_id?: string
  epic_code: string
  title: string
  description?: string
  assignee_id?: string
  assignee_code: string
  day_label: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  estimated_hours?: number
  documents?: string[]
  sort_order?: number
}

export const SPRINTS = [
  {
    id: 'sp-1', name: 'Sprint 1', theme: 'UI + Backend Supabase + Staging',
    start_date: '2026-04-20', end_date: '2026-04-24',
    status: 'active' as SprintStatus, progress_percent: 60,
    epics: ['E01 · UI & Frontend', 'E02 · Backend & Supabase'],
    assignees: ['Lê Khiêm'],
  },
  {
    id: 'sp-2', name: 'Sprint 2', theme: 'SSO + VnR Mapping + QC bắt đầu',
    start_date: '2026-04-27', end_date: '2026-05-02',
    status: 'upcoming' as SprintStatus, progress_percent: 0,
    epics: ['E03 · SSO & VnR Integration', 'E04 · QA & Go-live'],
    assignees: ['Developer 1', 'Ngân', 'QC Engineer'],
  },
  {
    id: 'sp-3', name: 'Sprint 3', theme: 'VnR Migration + Full QC → Go-live 15/5',
    start_date: '2026-05-05', end_date: '2026-05-15',
    status: 'upcoming' as SprintStatus, progress_percent: 0,
    epics: ['E03 · SSO & VnR Integration', 'E04 · QA & Go-live'],
    assignees: ['Developer 1', 'Ngân', 'QC Engineer', 'Lê Khiêm'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// 28 TASKS — plan mới 22/04/2026
// Sprint 1 (Khiêm) · Sprint 2 (Dev1 + Ngân + QC) · Sprint 3 (All → 15/5)
// ─────────────────────────────────────────────────────────────────────────────
export const TASKS: Task[] = [

  // ══ SPRINT 1 (20/4–24/4) — UI + Backend Supabase + Staging · Lê Khiêm ══════
  // E01 · UI & Frontend — done ✅
  { id:'s1-01', sprint_id:'sp-1', epic_code:'E01', sort_order:1,  assignee_code:'lk',   day_label:'T2 20/4',       type:'spec',   status:'done',        priority:'critical', title:'System architecture: tech stack + DB schema thiết kế',                   description:'Chốt tech stack (Angular 18 + Supabase + Vercel). Thiết kế DB schema: employees, positions, assessments, succession_plans, audit_logs, role_permissions. ERD + RLS policy plan.' },
  { id:'s1-02', sprint_id:'sp-1', epic_code:'E01', sort_order:2,  assignee_code:'lk',   day_label:'T2-T3 20-21/4', type:'dev',    status:'done',        priority:'critical', title:'UI Angular: Dashboard + Login + SSO button',                             description:'Dashboard: 4 KPI cards + risk table + succession alerts. Login screen: email/password + nút SSO VnR. Sidebar navigation 4 nhóm. Production-ready Angular 18.' },
  { id:'s1-03', sprint_id:'sp-1', epic_code:'E01', sort_order:3,  assignee_code:'lk',   day_label:'T3-T4 21-22/4', type:'dev',    status:'done',        priority:'critical', title:'UI Angular: Talent List + Talent Profile + 9-Box',                       description:'Talent List: search, filter, sort, radar chart. Talent Profile: hero 3-col + radar năng lực + network graph + risk factors + 360° assessment. 9-Box: grid interactive + calibration room.' },
  { id:'s1-04', sprint_id:'sp-1', epic_code:'E01', sort_order:4,  assignee_code:'lk',   day_label:'T4-T5 22-23/4', type:'dev',    status:'done',        priority:'critical', title:'UI Angular: Succession Map + Key Positions + Admin Panel',               description:'Succession Map: org tree dạng cây + compact view + successor pipeline. Key Positions: cards theo criticalLevel + add/edit drawer. Admin: 5 tabs CRUD + audit trail.' },
  { id:'s1-05', sprint_id:'sp-1', epic_code:'E01', sort_order:5,  assignee_code:'lk',   day_label:'T5 23/4',       type:'dev',    status:'done',        priority:'critical', title:'SSO OIDC/PKCE: config VnR HRM credentials + silent refresh',             description:'Implement PKCE flow, buildAuthorizeUrl(), exchangeCode(), refreshToken(). Config issuer ba.vnresource.net:1516, clientId hrm_scc_dev. Silent refresh iframe. Logout SSO endpoint.' },
  { id:'s1-06', sprint_id:'sp-1', epic_code:'E01', sort_order:6,  assignee_code:'lk',   day_label:'T5-T6 23-24/4', type:'dev',    status:'done',        priority:'critical', title:'Deploy Vercel staging + GitHub Actions CI/CD',                           description:'Deploy Angular app lên Vercel: succession-os-y6mt.vercel.app. GitHub Actions: build → test → deploy tự động. vercel.json SPA rewrites. Environment variables prod vs dev.' },

  // E02 · Backend & Supabase — in-progress / todo
  { id:'s1-07', sprint_id:'sp-1', epic_code:'E02', sort_order:7,  assignee_code:'lk',   day_label:'T2-T4 20-22/4', type:'dev',    status:'in-progress', priority:'critical', title:'Supabase: schema migration + RLS policies + auth setup',                  description:'Tạo tất cả tables trong Supabase: employees, positions, assessment_scores, nine_box_scores, succession_plans, audit_logs. RLS policies per role (admin/hr/manager/employee). Auth email + SSO JWT.' },
  { id:'s1-08', sprint_id:'sp-1', epic_code:'E02', sort_order:8,  assignee_code:'lk',   day_label:'T4-T5 22-23/4', type:'dev',    status:'todo',        priority:'critical', title:'Seed data Supabase: 25 nhân viên PTSC M&C + mock positions',              description:'Insert 25 employees PTSC M&C vào Supabase với đầy đủ: HRM360 scores, 9-Box tọa độ, risk factors, certifications, succession assignments. Seed 12 key positions với successors.' },
  { id:'s1-09', sprint_id:'sp-1', epic_code:'E02', sort_order:9,  assignee_code:'lk',   day_label:'T5-T6 23-24/4', type:'dev',    status:'todo',        priority:'critical', title:'Connect Angular ↔ Supabase: replace mock calls với real queries',        description:'Chuyển tất cả mock JSON sang Supabase client queries. useMock: false. Verify RLS đúng per role. Test tất cả flows với real Supabase data: login → dashboard → talent → succession.' },
  { id:'s1-10', sprint_id:'sp-1', epic_code:'E02', sort_order:10, assignee_code:'lk',   day_label:'T6 24/4',       type:'test',   status:'todo',        priority:'critical', title:'E2E smoke test: login → dashboard → talent → succession trên staging',    description:'Test toàn bộ happy path trên https://succession-os-y6mt.vercel.app/. Login (mock + SSO config). Dashboard KPI đúng. Talent list load. Succession Map render. Zero console errors.' },

  // ══ SPRINT 2 (27/4–02/5) — SSO + VnR Mapping + QC start ══════════════════
  // E03 · SSO & VnR Integration — Developer 1
  { id:'s2-01', sprint_id:'sp-2', epic_code:'E03', sort_order:1,  assignee_code:'dev1', day_label:'T2-T3 27-28/4', type:'dev',    status:'todo',        priority:'critical', title:'Test SSO flow end-to-end với VnR credentials thực',                      description:'Dùng credentials VnR thực để test OIDC flow: redirect → VnR login → callback → token exchange → userInfo. Verify scope, claims. Fix CORS nếu có. Log lỗi chi tiết.' },
  { id:'s2-02', sprint_id:'sp-2', epic_code:'E03', sort_order:2,  assignee_code:'dev1', day_label:'T3-T4 28-29/4', type:'dev',    status:'todo',        priority:'critical', title:'Auth bridge: VnR JWT token → Supabase session mapping',                  description:'Map VnR userInfo (employee_id, role, department) → Supabase custom JWT claims. Implement token refresh cross-system. Handle edge cases: VnR token expired, user not in Supabase.' },
  { id:'s2-03', sprint_id:'sp-2', epic_code:'E03', sort_order:3,  assignee_code:'dev1', day_label:'T4-T6 29/4-02/5', type:'dev', status:'todo',        priority:'critical', title:'VnR API connection: test employee + position endpoints',                  description:'Kết nối và test VnR internal API endpoints: GET /employees, GET /positions, GET /assessments. Verify authentication, data format, pagination. Document response schema cho Ngân.' },

  // E03 · VnR Backend Mapping — Ngân
  { id:'s2-04', sprint_id:'sp-2', epic_code:'E03', sort_order:4,  assignee_code:'ba2',  day_label:'T2-T3 27-28/4', type:'spec',   status:'todo',        priority:'critical', title:'Phân tích cấu trúc VnR backend: HRM cloud data model',                   description:'Làm việc với VnR team để hiểu cấu trúc: employees table, org chart, assessment schema, positions hierarchy. Document tất cả fields, data types, relationships, business rules.' },
  { id:'s2-05', sprint_id:'sp-2', epic_code:'E03', sort_order:5,  assignee_code:'ba2',  day_label:'T3-T4 28-29/4', type:'spec',   status:'todo',        priority:'critical', title:'Mapping VnR data model → SuccessionOS DB schema',                        description:'Map từng field VnR → Supabase: employee_id, name, department, position, assessment_scores (13 criteria), risk_factors. Handle mismatches, null fields, different data types. Export mapping document.' },
  { id:'s2-06', sprint_id:'sp-2', epic_code:'E03', sort_order:6,  assignee_code:'ba2',  day_label:'T5-T6 30/4-02/5', type:'spec', status:'todo',        priority:'critical', title:'Spec API bridge: VnR internal → Supabase sync plan + schedule',          description:'Thiết kế sync strategy: real-time webhook vs batch cron. Conflict resolution. Error handling. Define API bridge endpoints, payload format, retry logic. Estimate data volume PTSC M&C.' },

  // E04 · QA — QC Engineer
  { id:'s2-07', sprint_id:'sp-2', epic_code:'E04', sort_order:7,  assignee_code:'qc',   day_label:'T2-T3 27-28/4', type:'test',   status:'todo',        priority:'critical', title:'Viết test plan + test cases cho tất cả modules Sprint 1',                description:'Test plan toàn app: Dashboard, Talent, Succession, Positions, Admin. Test cases: happy path mỗi role (HR Admin/Manager/Employee) + edge cases + error states. Dùng staging URL.' },
  { id:'s2-08', sprint_id:'sp-2', epic_code:'E04', sort_order:8,  assignee_code:'qc',   day_label:'T4-T5 29-30/4', type:'test',   status:'todo',        priority:'critical', title:'Smoke test staging: tất cả flows với mock data',                         description:'Chạy hết test cases trên https://succession-os-y6mt.vercel.app/. Test 3 roles: login, navigate, CRUD. Verify UI responsive. Check console errors. Screenshot mỗi screen.' },
  { id:'s2-09', sprint_id:'sp-2', epic_code:'E04', sort_order:9,  assignee_code:'qc',   day_label:'T6 02/5',       type:'doc',    status:'todo',        priority:'normal',   title:'Bug report Sprint 1: phân loại P1/P2/P3 + assign fix',                   description:'Document tất cả bugs: severity, steps to reproduce, expected vs actual, screenshot. Phân loại P1 (blocker), P2 (major), P3 (minor). Assign cho đúng người. Estimate fix effort.' },

  // ══ SPRINT 3 (05/5–15/5) — VnR Migration + Full QC → GO-LIVE ══════════════
  // E03 · VnR Integration — Developer 1
  { id:'s3-01', sprint_id:'sp-3', epic_code:'E03', sort_order:1,  assignee_code:'dev1', day_label:'T2-T4 05-07/5', type:'dev',    status:'todo',        priority:'critical', title:'Implement VnR data sync: employees + assessments + positions',            description:'Build sync service: pull data từ VnR internal API → transform → upsert Supabase. Handle 25 PTSC M&C employees đầy đủ: profile, HRM360 scores, 9-Box, risk factors, certifications.' },
  { id:'s3-02', sprint_id:'sp-3', epic_code:'E03', sort_order:2,  assignee_code:'dev1', day_label:'T4-T6 07-09/5', type:'dev',    status:'todo',        priority:'critical', title:'API middleware: VnR cloud → Supabase real-time pipeline',                 description:'Deploy middleware service (Node.js hoặc Edge Function). Webhook từ VnR khi data thay đổi → sync Supabase ngay. Queue system cho batch sync. Monitor errors + alerts.' },
  { id:'s3-03', sprint_id:'sp-3', epic_code:'E03', sort_order:3,  assignee_code:'dev1', day_label:'T2-T4 11-13/5', type:'dev',    status:'todo',        priority:'critical', title:'Fix P1/P2 bugs từ QC + UAT + retest',                                    description:'Fix tất cả P1 bugs ngay lập tức. P2 bugs fix trong 24h. Không merge code mới cho đến khi hết P1. Retest sau mỗi fix. Deploy lên staging và notify QC verify.' },

  // E03 · VnR Mapping — Ngân
  { id:'s3-04', sprint_id:'sp-3', epic_code:'E03', sort_order:4,  assignee_code:'ba2',  day_label:'T2-T4 05-07/5', type:'spec',   status:'todo',        priority:'critical', title:'Validate business logic sau VnR data migration',                         description:'Verify data accuracy: HRM360 scores đúng 13 tiêu chí, 9-Box tọa độ correct, risk factors mapped đúng. Check edge cases: employees thiếu data, assessments cũ vs mới. Sign-off data quality.' },
  { id:'s3-05', sprint_id:'sp-3', epic_code:'E03', sort_order:5,  assignee_code:'ba2',  day_label:'T4-T5 07-08/5', type:'doc',    status:'todo',        priority:'critical', title:'Coordinate VnR team: API credentials + firewall + network access',        description:'Làm việc với VnR để lấy production API credentials, IP whitelist, firewall rules cho staging server. Confirm data sharing agreement PTSC M&C. Ghi lại tất cả access details.' },
  { id:'s3-06', sprint_id:'sp-3', epic_code:'E03', sort_order:6,  assignee_code:'ba2',  day_label:'T5-T6 08-09/5', type:'doc',    status:'todo',        priority:'normal',   title:'VnR integration handover document + runbook',                            description:'Document hoàn chỉnh: VnR API endpoints, credentials (encrypted), sync schedule, error handling runbook, escalation contacts VnR team. Dùng để onboard thêm developer sau này.' },

  // E04 · QA & Go-live — QC + All
  { id:'s3-07', sprint_id:'sp-3', epic_code:'E04', sort_order:7,  assignee_code:'qc',   day_label:'T2-T4 05-07/5', type:'test',   status:'todo',        priority:'critical', title:'Full regression test với VnR real data: 25 PTSC M&C employees',          description:'Chạy tất cả test cases với data thực từ VnR. Verify: HRM360 display đúng, 9-Box accurate, Succession Map correct, field visibility per role OK. Document kết quả mỗi test case.' },
  { id:'s3-08', sprint_id:'sp-3', epic_code:'E04', sort_order:8,  assignee_code:'qc',   day_label:'T4-T5 07-08/5', type:'test',   status:'todo',        priority:'critical', title:'UAT: test với user thực PTSC M&C — 3 roles',                             description:'Mời 3 users thực: HR Admin, Manager, Employee từ PTSC M&C test hệ thống. Happy path theo script. Ghi nhận feedback UX. Tiêu chí pass: zero P1 + user có thể hoàn thành task độc lập.' },
  { id:'s3-09', sprint_id:'sp-3', epic_code:'E04', sort_order:9,  assignee_code:'qc',   day_label:'T5-T6 08-09/5', type:'test',   status:'todo',        priority:'critical', title:'Retest sau fix + performance audit + security check',                     description:'Verify tất cả P1/P2 đã fix. Performance: page load < 3s, Supabase queries < 500ms. Security: RLS policies không bị bypass, no exposed API keys, HTTPS everywhere.' },
  { id:'s3-10', sprint_id:'sp-3', epic_code:'E04', sort_order:10, assignee_code:'lk',   day_label:'T2-T3 12-13/5', type:'dev',    status:'todo',        priority:'critical', title:'Fix remaining bugs + final hardening trước go-live',                      description:'Fix tất cả bugs còn lại từ retest. Final hardening: error boundaries, loading states, empty states. Update staging với phiên bản cuối cùng. Team review + approve.' },
  { id:'s3-11', sprint_id:'sp-3', epic_code:'E04', sort_order:11, assignee_code:'lk',   day_label:'T5-T6 14-15/5', type:'review', status:'todo',        priority:'critical', title:'🚀 Go-live sign-off: toàn team review + confirm production ready',         description:'Final checklist: VnR sync chạy OK, 25 employees live, zero P1, QC signed off, performance OK. Confirm với PTSC M&C. Announce go-live. Monitor production 24h đầu.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function computeStats(tasks: Task[]) {
  return {
    total:      tasks.length,
    done:       tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    blocked:    tasks.filter(t => t.status === 'blocked').length,
    critical:   tasks.filter(t => t.priority === 'critical').length,
  }
}

export function getSprintStats(sprintId: string) {
  return computeStats(TASKS.filter(x => x.sprint_id === sprintId))
}

export const SPRINT_1_STATS = getSprintStats('sp-1')

export const TASK_TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  spec:   { bg: '#EEF2FF', text: '#4F46E5', label: 'Spec' },
  story:  { bg: '#F0FDF4', text: '#15803D', label: 'Story' },
  design: { bg: '#F5F3FF', text: '#7C3AED', label: 'Design' },
  dev:    { bg: '#FFF7ED', text: '#C2410C', label: 'Dev' },
  test:   { bg: '#FEF9C3', text: '#854D0E', label: 'Test' },
  review: { bg: '#F1F5F9', text: '#475569', label: 'Review' },
  doc:    { bg: '#F0F9FF', text: '#0369A1', label: 'Doc' },
}

export const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  'todo':        { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF', label: 'Todo' },
  'in-progress': { bg: '#EFF6FF', text: '#3B82F6', dot: '#3B82F6', label: 'Đang làm' },
  'done':        { bg: '#F0FDF4', text: '#22C55E', dot: '#22C55E', label: 'Xong' },
  'blocked':     { bg: '#FEF2F2', text: '#EF4444', dot: '#EF4444', label: 'Blocked' },
  'outline':     { bg: '#F9F8F5', text: '#78716C', dot: '#A8A29E', label: 'Outline' },
}

export const PRIORITY_STYLES: Record<string, { text: string; label: string }> = {
  critical: { text: '#EF4444', label: 'Critical' },
  priority: { text: '#F97316', label: 'Priority' },
  normal:   { text: '#6B7280', label: 'Normal' },
  high:     { text: '#F97316', label: 'High' },
  medium:   { text: '#F59E0B', label: 'Medium' },
  low:      { text: '#6B7280', label: 'Low' },
}
