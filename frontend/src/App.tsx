import { BrowserRouter} from "react-router-dom";
import { SnackbarProvider } from 'notistack';
import AppRoutes from "./routes";

export default function App() {

  return (
    <BrowserRouter>
      <SnackbarProvider maxSnack={3}>
        <AppRoutes />
      </SnackbarProvider>
    </BrowserRouter>
  );
}
