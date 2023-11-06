import { Button, Container, Stack, Typography } from "@mui/material";
import { clearUser, userSignal } from "../../components/Provider";
import SearchRoom from "../../components/ChatRoom/SearchRoom";
import ChatList from "../../components/ChatRoom/ChatList";

const ChatRoom = () => {
  return (
    <Container maxWidth="lg">
      <Stack pt={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography>Hi {userSignal.value?.name}</Typography>
          <Button variant="contained" onClick={clearUser}>
            Sign out
          </Button>
        </Stack>
        <SearchRoom />
        <ChatList />
      </Stack>
    </Container>
  );
};

export default ChatRoom;
