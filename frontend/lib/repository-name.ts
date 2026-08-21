export function getRepositoryName(url: string) {
  const cleanUrl = url.replace(/\/+$/, "");
  const lastSegment = cleanUrl.split("/").pop();

  return lastSegment?.replace(/\.git$/, "")
    || "Untitled repository";
}
