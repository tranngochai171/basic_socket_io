import { useEffect, useState } from "react";
import { socketSignal, userSignal } from "../Provider";
import { Box, Stack, Typography } from "@mui/material";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Control, { CONTROL_TYPE } from "../ReactHookForm/Control";

type MessageType = {
  name: string;
  text: string;
  time: string;
};

const messageSchema = z.object({
  text: z.string().min(1, "Need to write something"),
});

type MesType = z.infer<typeof messageSchema>;

const ChatList = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  useEffect(() => {
    if (!socketSignal.value?.connected) {
      socketSignal.value?.connect();
    }

    socketSignal.value?.on("userList", ({ users: listUser }) => {
      setUsers(listUser);
    });
    socketSignal.value?.on("message", (data: MessageType) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    return () => {
      socketSignal.value?.off("userList");
      socketSignal.value?.off("message");
    };
  }, []);

  const methods = useForm<MesType>({
    defaultValues: {
      text: "",
    },
    resolver: zodResolver(messageSchema),
  });

  const sendMes = (data: MesType) => {
    socketSignal.value?.emit("message", {
      name: userSignal.value?.name,
      text: data.text,
    });
    methods.reset();
  };

  if (userSignal.value?.name && userSignal.value?.room) {
    return (
      <Stack>
        <Box sx={{ height: "50dvh", flexGrow: 1, overflowY: "auto" }}>
          <Stack>
            {messages.length > 0
              ? messages.map((mes, index) => (
                  <Stack
                    sx={{
                      alignSelf:
                        mes.name === userSignal.value?.name
                          ? "flex-end"
                          : "flex-start",
                    }}
                    key={`${mes.time}_${index}`}
                  >
                    {mes.text}
                  </Stack>
                ))
              : null}
          </Stack>
        </Box>
        <Typography>Number of people in this room: {users?.length}</Typography>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(sendMes)}>
            <Stack alignItems="center">
              <Control
                control={CONTROL_TYPE.INPUT}
                name="text"
                label="Type here"
              />
            </Stack>
          </form>
        </FormProvider>
      </Stack>
    );
  }
  return null;
};

export default ChatList;
