import { fetchModels } from "../lib/api";
import ModelsExplorer from "../components/ModelsExplorer";

export default async function Page() {
  const models = await fetchModels({ active: true });
  return (
    <div>
      <h1 className="section-title">Vitrine</h1>
      <ModelsExplorer initialModels={models} />
    </div>
  );
}
