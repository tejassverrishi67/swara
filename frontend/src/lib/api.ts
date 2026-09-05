// Thin wrapper — swap mock imports for real fetch calls here when backend is ready
export { mockExpand as expand, mockSpeak as speak } from "./mockApi";
export type { Candidate, ExpandResponse } from "./mockApi";
