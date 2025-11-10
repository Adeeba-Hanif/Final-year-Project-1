import { AuthProvider } from "./auth"

export { useAuthContext } from "./auth"

const CombinedContextProvider = ({ children }) => (
    <AuthProvider>
        {children}
    </AuthProvider>
)

export default CombinedContextProvider;