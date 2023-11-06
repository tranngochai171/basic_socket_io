import { useLayoutEffect } from "react";
import { Socket, io } from "socket.io-client";
import { effect, signal } from "@preact/signals-react";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  room: z.string().optional(),
});

type UserType = z.infer<typeof userSchema>;

export const getUserFromLocalStorage = () => {
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
    const result = userSchema.safeParse(user);
    if (result.success) {
      return result.data;
    }
  }
  return null;
};

export const setUser = (user: UserType) => {
  localStorage.setItem("user", JSON.stringify(user));
  userSignal.value = user;
};

export const clearUser = () => {
  localStorage.removeItem("user");
  userSignal.value = null;
  socketSignal.value?.emit("leaveRoom");
};

type ProviderProps = {
  children: React.ReactNode;
};

export const socketSignal = signal<
  Socket<DefaultEventsMap, DefaultEventsMap> | undefined
>(undefined);

export const userSignal = signal<{ name?: string; room?: string } | null>(
  getUserFromLocalStorage(),
);

effect(() => {
  if (!socketSignal.value?.connected) {
    socketSignal.value = socketSignal.value?.connect();
  }
  if (userSignal.value?.name && userSignal.value?.room) {
    socketSignal.value?.emit("enterRoom", {
      name: userSignal.value?.name,
      room: userSignal.value?.room,
    });
  }
});

const Provider = ({ children }: ProviderProps) => {
  useLayoutEffect(() => {
    const socket = io(import.meta.env.VITE_BE_URL);
    socket.connect();
    socketSignal.value = socket;
    return () => {
      socket.disconnect();
    };
  }, []);
  return children;
};

export default Provider;
