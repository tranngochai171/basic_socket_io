import { Button, Stack, Typography } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import Control, { CONTROL_TYPE } from "../ReactHookForm/Control";
import { zodResolver } from "@hookform/resolvers/zod";
import { setUser, socketSignal, userSignal } from "../Provider";
import { useEffect, useState } from "react";

const searchSchema = z.object({
  search: z.string().min(1, "Required"),
});

type SearchType = z.infer<typeof searchSchema>;

const SearchRoom = () => {
  const [rooms, setRooms] = useState<string[]>([]);
  const [searchParam, setSearchParams] = useSearchParams({
    search: "",
  });
  const onSearch = (data: SearchType) => {
    searchParam.set("search", data.search);
    setSearchParams(searchParam);
    const user = {
      name: userSignal.value?.name || "",
      room: data.search,
    };
    setUser(user);
  };
  const methods = useForm<SearchType>({
    defaultValues: { search: searchParam.get("search") || "" },
    resolver: zodResolver(searchSchema),
  });

  useEffect(() => {
    if (!socketSignal.value?.connected) {
      socketSignal.value?.connect();
    }
    socketSignal.value?.emit("getAllActiveRooms");
    socketSignal.value?.on("roomList", ({ rooms: listRoom }) => {
      setRooms(listRoom);
    });
    return () => {
      socketSignal.value?.off("roomList");
    };
  }, []);

  return (
    <Stack>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSearch)}>
          <Stack
            gap={2}
            direction="row"
            alignItems="flex-start"
            justifyContent="center"
          >
            <Control
              name="search"
              control={CONTROL_TYPE.INPUT}
              label="Create Room"
            />
            <Button type="submit" sx={{ mt: 1 }}>
              Create
            </Button>
          </Stack>
        </form>
      </FormProvider>
      {rooms?.length > 0 ? (
        <Stack>
          <Typography>List Available Room</Typography>
          <Stack direction="row">
            {rooms.map((room, index) => (
              <Button
                key={`${room}_${index}`}
                onClick={() => {
                  if (userSignal.value?.room !== room) {
                    const user = {
                      name: userSignal.value?.name || "",
                      room,
                    };
                    setUser(user);
                  }
                }}
              >
                {room}
              </Button>
            ))}
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default SearchRoom;
