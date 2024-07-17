export const useUser = () => {
  interface IUser {
    id: number
    name: string
    role: string
  }

  const userValue = reactive<IUser | Record<string, never>>({})

  const stored = localStorage.getItem('user')

  if (stored) {
    const sotredValue: IUser = JSON.parse(stored)
    Object.assign(userValue, sotredValue)
  }

  function set(data: IUser | null) {
    if (data) {
      localStorage.setItem('user', JSON.stringify(data))
    }
    else {
      localStorage.removeItem('user')
    }
  }

  return { user: userValue, set }
}
