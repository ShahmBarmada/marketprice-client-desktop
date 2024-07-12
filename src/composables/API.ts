export const useAPI = () => {
  const urlValue = ref("");

  if (localStorage.getItem("api_url")) {
    urlValue.value = localStorage.getItem("api_url")!;
  }

  function setURL(url: string) {
    urlValue.value = url;
    localStorage.setItem("api_url", url);
  }

  return { url: urlValue.value, setURL };
};
