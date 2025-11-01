import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { queryKeys, usePlayer } from "../../hooks/usePlayers";
import apiClient from "../../services/api-client";
import { ErrorResponse } from "../../types/common";
import { NewPlayer, NewPlayerWithId } from "../../types/players";
import {
  PLAYER_BAT_STYLES,
  PLAYER_BOWL_STYLES,
  PLAYER_ROLES_LABEL,
  PlayerBowlStyles,
  PlayerRoles,
} from "../../utils/constants";
import { capitalize } from "../../utils/converters";
import ComboBoxElement from "../components/ComboBoxElement";
import DateTimeElement from "../components/DateTimeElement";
import DynamicComboBoxElement from "../components/DynamicComboBoxElement";
import ErrorElement from "../components/ErrorElement";
import InputElement from "../components/InputElement";
import Spinner from "../components/Spinner";

const ROLES = Object.entries(PLAYER_ROLES_LABEL).map((item) => {
  return { label: item[1], value: item[0] as PlayerRoles };
});

const BAT_STYLES = Object.entries(PLAYER_BAT_STYLES).map((item) => {
  return { label: `${capitalize(item[0])} handed`, value: item[1] };
});

const BOWL_STYLES: {
  label: string;
  value: PlayerBowlStyles | undefined;
}[] = Object.entries(PLAYER_BOWL_STYLES).map((item) => {
  return {
    label: `${capitalize(item[0]).replaceAll("_", " ")}`,
    value: item[1],
  };
});
BOWL_STYLES.unshift({
  value: undefined,
  label: "N/A",
});

const PlayerForm = () => {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;
  const isEdit = !!id;

  const { data, error, isLoading } = usePlayer(id);

  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string>("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<NewPlayer>({
    resolver: zodResolver(NewPlayer),
    values: data,
  });
  const { mutate, isPending } = useMutation<
    NewPlayerWithId,
    AxiosError<ErrorResponse>,
    NewPlayer
  >({
    async mutationFn(newPlayer) {
      let response;
      if (isEdit) {
        response = await apiClient.patch<NewPlayerWithId>(
          `players/${id}`,
          newPlayer
        );
      } else {
        response = await apiClient.post<NewPlayerWithId>("players", newPlayer);
      }

      return response.data;
    },
    onMutate() {
      setFormError("");
    },
    onSuccess(data, variables) {
      reset();
      queryClient.invalidateQueries({
        queryKey: [queryKeys.base],
        type: "inactive",
      });

      if (isEdit) {
        queryClient.setQueryData(queryKeys.player(id), data);
      }
    },
    onError(error) {
      let errorMsg = error.message;
      if (error.response?.data) {
        errorMsg = error.response.data.message;
      }

      setFormError(errorMsg);
    },
  });

  const onSubmit: SubmitHandler<NewPlayer> = (data) => {
    console.log("data", data);
    mutate(data);
  };

  return (
    <div className="border border-slate-900/10 py-10 px-8 rounded-xl">
      <div className="mb-5">
        <h1 className="text-base font-medium text-slate-900">
          {isEdit ? "Edit" : "Create"} Player
        </h1>
        <div className="text-sm text-gray-700 mt-1">
          {isEdit
            ? "Edit the player to perfection"
            : "Add a new player to the platform"}
        </div>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute z-10 inset-0 bg-white/65">
            <div className="flex justify-center mt-24">
              <Spinner />
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-6 gap-x-5 gap-y-4">
            <div className="col-span-3">
              <InputElement
                label="Name"
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
            <div className="col-span-3">
              <InputElement
                label="Short Name"
                {...register("shortName", {
                  required: true,
                })}
              />
              {errors.shortName && (
                <ErrorElement className="mt-1.5">
                  {errors.shortName.message}
                </ErrorElement>
              )}
            </div>

            <div className="col-span-2">
              <Controller
                name="roleInfo.role"
                control={control}
                render={({ field }) => {
                  if (!field.value) {
                    setValue("roleInfo.role", ROLES[0].value);
                  }

                  return (
                    <ComboBoxElement
                      label="Role"
                      options={ROLES}
                      selectedValue={field.value}
                      onOptionSelect={(val) => {
                        // @ts-ignore
                        setValue("roleInfo.role", val);
                      }}
                      {...register("roleInfo.role")}
                    />
                  );
                }}
              />
              {errors.roleInfo?.role && (
                <ErrorElement className="mt-1.5">
                  {errors.roleInfo.role.message}
                </ErrorElement>
              )}
            </div>

            <div className="col-span-2">
              <Controller
                name="roleInfo.batStyle"
                control={control}
                render={({ field }) => {
                  if (!field.value) {
                    setValue("roleInfo.batStyle", BAT_STYLES[0].value);
                  }

                  return (
                    <ComboBoxElement
                      label="Bat Style"
                      options={BAT_STYLES}
                      selectedValue={field.value}
                      onOptionSelect={(val) => {
                        // @ts-ignore
                        setValue("roleInfo.batStyle", val);
                      }}
                      {...register("roleInfo.batStyle")}
                    />
                  );
                }}
              />
              {errors.roleInfo?.batStyle && (
                <ErrorElement className="mt-1.5">
                  {errors.roleInfo.batStyle.message}
                </ErrorElement>
              )}
            </div>

            <div className="col-span-2">
              <Controller
                name="roleInfo.bowlStyle"
                control={control}
                render={({ field }) => {
                  return (
                    <ComboBoxElement
                      label="Bowl Style"
                      options={BOWL_STYLES}
                      selectedValue={field.value}
                      onOptionSelect={(val) => {
                        // @ts-ignore
                        setValue("roleInfo.bowlStyle", val);
                      }}
                      {...register("roleInfo.bowlStyle")}
                    />
                  );
                }}
              />
              {errors.roleInfo?.bowlStyle && (
                <ErrorElement className="mt-1.5">
                  {errors.roleInfo.bowlStyle.message}
                </ErrorElement>
              )}
            </div>
            <div className="col-span-2">
              <Controller
                name="team"
                control={control}
                render={({ field }) => {
                  console.log("field ", field);
                  return (
                    <DynamicComboBoxElement
                      label="Team"
                      selectedValue={field.value}
                      onOptionSelect={(val) => {
                        if (val) {
                          setValue("team", val);
                        }
                      }}
                      {...register("team")}
                    />
                  );
                }}
              />
              {errors.team && (
                <ErrorElement className="mt-1.5">
                  {errors.team.message}
                </ErrorElement>
              )}
            </div>
            <div className="col-span-2 hidden">
              <InputElement
                label="Team"
                {...register("team", {
                  required: true,
                  valueAsNumber: true,
                  value: 1,
                })}
              />
              {errors.team && (
                <ErrorElement className="mt-1.5">
                  {errors.team.message}
                </ErrorElement>
              )}
            </div>
            <div className="col-span-2">
              <DateTimeElement
                label="Birth Date"
                type="date"
                {...register("personalInfo.birthDate", {
                  required: true,
                  valueAsDate: true,
                })}
              />
              {errors.personalInfo?.birthDate && (
                <ErrorElement className="mt-1.5">
                  {errors.personalInfo.birthDate.message}
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
          {(formError || error) && (
            <ErrorElement className="mt-3 text-lg">
              {formError || error?.message}
            </ErrorElement>
          )}
        </form>
      </div>
    </div>
  );
};

export default PlayerForm;
