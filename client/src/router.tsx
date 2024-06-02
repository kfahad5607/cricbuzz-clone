import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import MatchPage from "./pages/MatchPage";
import CommentaryTab from "./components/CommentaryTab";
import ScorecardTab from "./components/ScorecardTab";
import SquadsTab from "./components/SquadsTab";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "matches/:matchId/:matchSlug",
        element: <MatchPage />,
        children: [
          {
            index: true,
            element: <CommentaryTab />,
          },
          {
            path: "commentary",
            element: <CommentaryTab />,
          },
          {
            path: "scorecard",
            element: <ScorecardTab />,
          },
          {
            path: "squads",
            element: <SquadsTab />,
          },
        ],
      },
    ],
  },
]);

export default router;
