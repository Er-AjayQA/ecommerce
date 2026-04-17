import AppRoutes from "./routes/AppRoutes";
import AppProvider from "./app/provider";

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
