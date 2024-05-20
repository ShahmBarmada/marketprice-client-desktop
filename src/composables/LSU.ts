export const useLSU = () => {
  if (localStorage.getItem("lsu")) {
    return ref(localStorage.getItem("lsu"));
  } else {
    return ref("");
  }
};
