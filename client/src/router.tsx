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
import ScheduledMatchesPage from "./pages/ScheduledMatchesPage";
import ScheduledMatchesTab from "./components/ScheduledMatchesTab";
import AllSeriesPage from "./pages/AllSeriesPage";
import MatchesByDayPage from "./pages/MatchesByDayPage";
import AdminLayout from "./admin/layouts/Layout";
import DashboardPage from "./admin/pages/DashboardPage";
import AllVenues from "./admin/pages/AllVenues";
import AllPlayers from "./admin/pages/AllPlayers";
import AllTeams from "./admin/pages/AllTeams";
import AllSeries from "./admin/pages/AllSeries";
import VenueForm from "./admin/pages/VenueForm";

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
        path: "series",
        element: <AllSeriesPage />,
      },
      {
        path: "matches",
        element: <ScheduledMatchesPage />,
        children: [
          {
            index: true,
            element: <Navigate to="/matches/live" replace={true} />,
          },
          {
            path: ":scheduleType",
            element: <ScheduledMatchesTab />,
          },
        ],
      },
      {
        path: "matches-by-day",
        element: <MatchesByDayPage />,
      },
    ],
  },
  {
    path: "admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "series",
        element: <AllSeries />,
      },
      {
        path: "teams",
        element: <AllTeams />,
      },
      {
        path: "players",
        element: <AllPlayers />,
      },
      {
        path: "venues",
        element: <AllVenues />,
      },
      {
        path: "venues/create",
        element: <VenueForm />,
      },
      {
        path: "venues/edit/:id",
        element: <VenueForm />,
      },
    ],
  },
]);

export default router;
