import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import MatchPage from "./pages/MatchPage";
import CommentaryTab from "./components/CommentaryTab";
import ScorecardTab from "./components/ScorecardTab";
import SquadsTab from "./components/SquadsTab";
import FullCommentaryTab from "./components/FullCommentaryTab";
import HighlightsTab from "./components/HighlightsTab";
import SeriesPage from "./pages/SeriesPage";
import SeriesMatches from "./components/SeriesMatches";
import SeriesVenues from "./components/SeriesVenues";
import SeriesSquads from "./components/SeriesSquads";
import LiveScoresPage from "./pages/LiveScoresPage";
import LiveScoresTab from "./components/LiveScoresTab";

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
            element: <Navigate to="commentary" replace={true} />,
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
      {
        path: "series/:seriesId/:seriesSlug",
        element: <SeriesPage />,
        children: [
          {
            index: true,
            element: <Navigate to="matches" replace={true} />,
          },
          {
            path: "matches",
            element: <SeriesMatches />,
          },
          {
            path: "squads",
            element: <SeriesSquads />,
          },
          {
            path: "venues",
            element: <SeriesVenues />,
          },
        ],
      },
      {
        path: "matches/live-scores",
        element: <LiveScoresPage />,
        children: [
          {
            index: true,
            element: <LiveScoresTab />,
          },
          {
            path: "recent",
            element: <h3>Recent Matches</h3>,
          },
          {
            path: "upcoming",
            element: <h3>upcoming Matches</h3>,
          },
        ],
      },
    ],
  },
]);

export default router;
