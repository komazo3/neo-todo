import SubHeader from "@/app/components/subHeader";
import Form from "./form";

export const metadata = {
  title: "TODOを追加 | Todo Today",
  description: "新しいTODOを追加します。",
};

export default function NewTodoPage() {
  return (
    <>
      <SubHeader title="TODOを追加" />
      <Form />
    </>
  );
}
