export const useUserData = () => {
  let permsValue = localStorage.getItem("perms");

  if (permsValue === null) {
    permsValue = '{"all":false}';
  }

  const user = useState("user", () =>
    reactive({
      id: localStorage.getItem("id"),
      name: localStorage.getItem("name"),
      role: localStorage.getItem("role"),
      perms: JSON.parse(permsValue),
    })
  );
  return user;
};
