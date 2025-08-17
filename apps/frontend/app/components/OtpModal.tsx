import { FaSpinner } from "react-icons/fa";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import axios from "axios";
import { useAuthStore } from "../[utils]/AuthStore";
import { useToast } from "@/hooks/use-toast";

const OtpModal = ({
  isOpen,
  onClose,
  email,
}: {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const login = useAuthStore((state) => state.login);
  const { toast } = useToast();

  const otpForm = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .length(6, "OTP must be exactly 6 digits")
        .matches(/^[0-9]+$/, "OTP must be numeric")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const res = await axios.post(`${backendUrl}/auth/verify-otp`, {
          email: email,
          otp: values.otp,
        });
        if (res.status === 200) {
          setValue("");
          console.log(res.data);
          toast({
            title: "Log in Success",
            description: "You are logged in successfully",
          });
          login(res.data.user, res.data.token, res.data.id);
          setLoading(false);
          onClose();
        }
      } catch (e) {
        console.error(e);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong",
        });
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 h-screen w-screen z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gradient-to-tr from-neutral-600 to-neutral-800 rounded-lg border border-gray-600 w-80 p-6">
        <h2 className="text-lg font-semibold mb-4 text-yellow-400">
          Enter OTP
        </h2>
        <p className="text-sm text-white mb-8">
          We've sent a 6-digit OTP to your email. Please enter it below to
          verify your account.
        </p>
        <form
          onSubmit={otpForm.handleSubmit}
          className="flex flex-col items-center gap-4"
        >
          <InputOTP
            maxLength={6}
            value={value}
            onChange={(value) => {
              setValue(value);
              otpForm.setFieldValue("otp", value);
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {otpForm.touched.otp && otpForm.errors.otp ? (
            <div className="text-red-500 text-sm mt-1">
              {otpForm.errors.otp}
            </div>
          ) : null}
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              className="bg-gradient-to-br text-black/90 from-yellow-300/80 to-yellow-700/80 hover:bg-yellow-400"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                "Submit OTP"
              )}
            </Button>
            <Button
              className="bg-gradient-to-br text-black/90 from-gray-400/80 to-gray-600/80 hover:bg-gray-500"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpModal;
