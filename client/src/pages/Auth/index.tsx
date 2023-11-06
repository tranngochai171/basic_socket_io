import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import Control, { CONTROL_TYPE } from "../../components/ReactHookForm/Control";
import { Button, Container, Stack } from "@mui/material";
import { setUser } from "../../components/Provider";
import { useNavigate } from "react-router";

const schema = z.object({
  name: z.string().min(1, "Name is Required"),
});

type AuthType = z.infer<typeof schema>;

const Auth = () => {
  const navigate = useNavigate();
  const methods = useForm<AuthType>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(schema),
  });
  const onSubmit = (data: AuthType) => {
    const user = { name: data.name };
    setUser(user);
    navigate("/");
  };
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Container
          maxWidth="lg"
          sx={{ display: "grid", placeContent: "center", height: "100dvh" }}
        >
          <Stack gap={2}>
            <Control control={CONTROL_TYPE.INPUT} name="name" label="Name" />
            <Button variant="contained" type="submit">
              Submit
            </Button>
          </Stack>
        </Container>
      </form>
    </FormProvider>
  );
};

export default Auth;
