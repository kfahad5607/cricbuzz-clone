import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import MatchPage from "./pages/MatchPage";
import CommentaryTab from "./components/CommentaryTab";
import ScorecardTab from "./components/ScorecardTab";
import SquadsTab from "./components/SquadsTab";
import FullCommentaryTab from "./components/FullCommentaryTab";
import HighlightsTab from "./components/HighlightsTab";

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
            element: <Navigate to={"commentary"} replace={true} />,
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
          {
            path: "highlights",
            element: <HighlightsTab />,
          },
          {
            path: "full-commentary",
            element: <FullCommentaryTab />,
          },
        ],
      },
    ],
  },
]);

export default router;
