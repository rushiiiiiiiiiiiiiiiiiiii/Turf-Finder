
import RegisterForm from "@/components/auth/RegisterForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <RegisterForm/>
      </div>
    </div>
  );
};

export default Login;
