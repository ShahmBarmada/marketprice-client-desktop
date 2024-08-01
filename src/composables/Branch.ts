export const useBranch = () => {
  interface IBranch {
    id: number
    label: string
  }
  const stored = localStorage.getItem('branch')

  const branch = useState<IBranch>('defBranch', () =>
    stored ? JSON.parse(stored) : { id: 0, label: '' }
  )

  function set(data: IBranch | null) {
    if (data) {
      localStorage.setItem('branch', JSON.stringify(data))
      branch.value = data
    } else {
      localStorage.removeItem('branch')
      branch.value = { id: 0, label: '' }
    }
  }

  return { branch: branch.value, set }
}
