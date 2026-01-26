export type TodoDTO = {
  id: number;
  title: string;
  content: string;
  status: "UNTOUCHED" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: Date;
};

export type UserDTO = {
  id: string;
  name: string;
};
