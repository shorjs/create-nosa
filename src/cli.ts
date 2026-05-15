import { cancel, intro, isCancel, note, outro, text } from "@clack/prompts";

export async function runCli() {
  intro("create-nosa");

  const projectName = await text({
    message: "Project name",
    placeholder: "my-nosa-app",
    validate(value) {
      if (!value?.trim()) {
        return "Project name is required";
      }
    },
  });

  if (isCancel(projectName)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const normalizedProjectName = projectName.trim();

  note("No template available for now.", "Template");
  outro(`No project generated for ${normalizedProjectName}.`);
}
