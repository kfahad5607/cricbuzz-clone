import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Venue, VenueWithId } from "../../types/venue";
import InputElement from "../components/InputElement";
import SelectElement from "../components/SelectElement";
import ErrorElement from "../components/ErrorElement";
import apiClient from "../../services/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosError } from "axios";
import { ErrorResponse } from "../../types/common";
import Spinner from "../components/Spinner";

const countries = [
  { value: "Afghanistan", label: "Afghanistan" },
  { value: "Australia", label: "Australia" },
  { value: "Bangladesh", label: "Bangladesh" },
  { value: "Canada", label: "Canada" },
  { value: "England", label: "England" },
  { value: "India", label: "India" },
  { value: "Ireland", label: "Ireland" },
  { value: "Namibia", label: "Namibia" },
  { value: "Nepal", label: "Nepal" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Oman", label: "Oman" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "Papua New Guinea", label: "Papua New Guinea" },
  { value: "Scotland", label: "Scotland" },
  { value: "South Africa", label: "South Africa" },
  { value: "Sri Lanka", label: "Sri Lanka" },
  { value: "Uganda", label: "Uganda" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "United States", label: "United States" },
  { value: "West Indies", label: "West Indies" },
  { value: "Zimbabwe", label: "Zimbabwe" },
];

const timezones = [
  { label: "Afghanistan Standard Time (GMT +04:30)", value: "Asia/Kabul" },
  {
    label: "Australian Eastern Standard Time (GMT +10:00)",
    value: "Australia/Sydney",
  },
  { label: "Bangladesh Standard Time (GMT +06:00)", value: "Asia/Dhaka" },
  {
    label: "Caribbean Standard Time (GMT -04:00)",
    value: "America/Port_of_Spain",
  },
  { label: "English Standard Time (GMT +00:00)", value: "Europe/London" },
  { label: "Indian Standard Time (GMT +05:30)", value: "Asia/Calcutta" },
  { label: "Irish Standard Time (GMT +01:00)", value: "Europe/Dublin" },
  {
    label: "New Zealand Standard Time (GMT +12:00)",
    value: "Pacific/Auckland",
  },
  { label: "Pakistan Standard Time (GMT +05:00)", value: "Asia/Karachi" },
  {
    label: "South African Standard Time (GMT +02:00)",
    value: "Africa/Johannesburg",
  },
  { label: "Sri Lanka Standard Time (GMT +05:30)", value: "Asia/Colombo" },
  { label: "Zimbabwe Standard Time (GMT +02:00)", value: "Africa/Harare" },
];

const VenueForm = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Venue>({
    resolver: zodResolver(Venue),
  });
  const { mutate, isPending } = useMutation<
    VenueWithId,
    AxiosError<ErrorResponse>,
    Venue
  >({
    async mutationFn(newVenue) {
      const response = await apiClient.post<VenueWithId>("venues", newVenue);

      return response.data;
    },
    onMutate() {
      setError("");
    },
    onSuccess(data, variables) {
      console.log("onSuccess ", data, variables);
      reset();
      queryClient.invalidateQueries({
        queryKey: ["venues"],
      });
    },
    onError(error) {
      let errorMsg = error.message;
      if (error.response?.data) {
        errorMsg = error.response.data.message;
      }

      setError(errorMsg);
    },
  });

  const onSubmit: SubmitHandler<Venue> = (data) => {
    // console.log("data ", data);
    mutate(data);
  };

  return (
    <div className="border border-slate-900/10 py-10 px-8 rounded-xl">
      <div className="mb-5">
        <h1 className="text-base font-medium text-slate-900">Create Venue</h1>
        <div className="text-sm text-gray-700 mt-1">
          Add a new venue to the platform
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <div className="col-span-1">
            <InputElement
              label="Venue Name"
              {...register("name", {
                required: true,
              })}
            />
            {errors.name && (
              <ErrorElement className="mt-1.5">
                {errors.name.message}
              </ErrorElement>
            )}
          </div>
          <div className="col-span-1">
            <InputElement
              label="City"
              {...register("city", {
                required: true,
              })}
            />
            {errors.city && (
              <ErrorElement className="mt-1.5">
                {errors.city.message}
              </ErrorElement>
            )}
          </div>

          <div className="col-span-1">
            <SelectElement
              label="Country"
              options={countries}
              {...register("country", {
                required: true,
              })}
            />
            {errors.country && (
              <ErrorElement className="mt-1.5">
                {errors.country.message}
              </ErrorElement>
            )}
          </div>
          <div className="col-span-1">
            <SelectElement
              label="Timezone"
              options={timezones}
              {...register("timezone", {
                required: true,
              })}
            />
            {errors.timezone && (
              <ErrorElement className="mt-1.5">
                {errors.timezone.message}
              </ErrorElement>
            )}
          </div>
        </div>

        <div className="mt-8">
          <button
            disabled={isPending}
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 inline-flex items-center disabled:opacity-80 disabled:pointer-events-none"
          >
            {isPending ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : (
              <>Save</>
            )}
          </button>
        </div>
        {error && <ErrorElement className="mt-3 text-lg">{error}</ErrorElement>}
      </form>
    </div>
  );
};

export default VenueForm;
