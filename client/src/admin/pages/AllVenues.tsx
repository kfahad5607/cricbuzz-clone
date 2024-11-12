import { useVenues } from "../../hooks/useVenues";

const columns = [
  {
    label: "Name",
  },
  {
    label: "City",
  },
  {
    label: "Country",
  },
  {
    label: "Action",
  },
];

const AllVenues = () => {
  const { data, error, isLoading } = useVenues();

  return (
    <div className="border border-slate-900/10 py-10 px-8 rounded-xl">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-base font-medium text-slate-900">Venues</h1>
          <div className="text-sm text-gray-700 mt-1">
            A list of all the users in your account including their name, title,
            email and role.
          </div>
        </div>
        <div>
          <button
            type="button"
            className="block rounded-md px-3 py-2 text-center text-sm font-medium text-white bg-blue-600 shadow-sm"
          >
            Add venue
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto mt-8 sm:rounded-lg">
        {isLoading && <p>Venues are loading</p>}
        {error && <p>Something went wrong! {error.message}</p>}
        {data && data.length > 0 ? (
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {columns.map((column, columnIdx) => (
                  <th
                    key={columnIdx}
                    scope="col"
                    className="px-6 py-3 first:pl-0 last:pr-0"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((venue) => (
                <tr
                  key={venue.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap first:pl-0 last:pr-0 dark:text-white"
                  >
                    {venue.name}
                  </th>
                  <td className="px-6 py-4">{venue.city}</td>
                  <td className="px-6 py-4">{venue.country}</td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href="#"
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data to show here</p>
        )}
      </div>
    </div>
  );
};

export default AllVenues;
