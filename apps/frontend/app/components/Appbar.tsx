"use client";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { FaWallet, FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import OtpModal from "./OtpModal";
import axios from "axios";
import { useAuthStore } from "../[utils]/AuthStore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export const Appbar = () => {
  const router = useRouter();
  const [wallet, setWallet] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const backendUrl = "http://localhost:3121";
  useEffect(() => {
    // Simulate checking auth status (Replace with actual implementation)
    const loadAuthStatus = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsAuthLoaded(true);
    };
    loadAuthStatus();
  }, []);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openOtpModal = () => setIsOtpModalOpen(true);
  const closeOtpModal = () => setIsOtpModalOpen(false);

  const initialValues = {
    email: "",
  };
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
  });
  const handleSubmit = async (values: any) => {
    try {
      const res = await axios.post(`${backendUrl}/auth/signin`, {
        email: values.email,
      });
      if (res.status === 200) {
        setEmail(values.email);
        closeLoginModal();
        openOtpModal();
      }
    } catch (e) {
      console.error(e);
    }
  };
  const handleWallet = () => {
    toast({
      title: "Wallet",
      description: "Wallet is not yet implemented",
    });
  };

  return (
    <div className="backdrop-blur-md bg-gradient-to-tr from-white/10 to-black/70 border-b border-slate-700 shadow-md sticky z-50 top-0">
      <div className="flex justify-between items-center px-4 md:px-16 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <div
            className="text-lg pl-2 md:pl-4 flex flex-col justify-center cursor-pointer text-white font-semibold hover:text-gray-300 transition duration-300"
            onClick={() => router.push("/")}
          >
            MarketView
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="flex items-center space-x-6 md:pr-6">
          <TooltipProvider>
            <div className="flex gap-10">
              <div className="hidden md:block">
                <Tooltip delayDuration={150}>
                  <TooltipTrigger>
                    <div className="relative cursor-pointer text-white hover:text-gray-300 transition duration-300 flex items-center space-x-5 border border-neutral-600 rounded-full p-1.5 px-3">
                      <FaWallet size={20} />
                      <p>{wallet}$</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gradient-to-tr from-neutral-600 to-neutral-800">
                    <div className="flex flex-col gap-5">
                      <Button
                        className="bg-gradient-to-br text-black/90 from-yellow-300/80 to-yellow-700/80 hover:bg-yellow-400"
                        onClick={handleWallet}
                      >
                        Add Money
                      </Button>
                      <Button
                        className="bg-gradient-to-br text-black/90 from-yellow-300/80 to-yellow-700/80 hover:bg-yellow-400"
                        onClick={handleWallet}
                      >
                        Deposit Money
                      </Button>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              {isAuthLoaded ? (
                isAuthenticated ? (
                  <div>
                    <div onClick={() => router.push("/dashboard/user")}>
                      <div className="bg-white/20 rounded-full hover:bg-white/30 transition duration-300 fade-in-10 p-2 cursor-pointer">
                        <FaUser size={20} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Button
                      onClick={openLoginModal}
                      className="bg-gradient-to-br text-sm md:text-base font-semibold text-black/90 from-yellow-300/80 to-yellow-700/80 hover:bg-yellow-400"
                    >
                      Log In
                    </Button>
                  </div>
                )
              ) : (
                <Skeleton className="w-10 h-10 rounded-full" />
              )}
            </div>
          </TooltipProvider>
        </div>
      </div>

      {isLoginModalOpen && (
        <div className="fixed top-0 left-0 h-screen w-full flex justify-center items-center bg-black/70 z-50">
          <div className="bg-gradient-to-tr from-neutral-600 to-neutral-800 rounded-lg border border-gray-600 shadow-xl p-6 w-11/12 max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-yellow-400">
              Log In
            </h2>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-white"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <Field
                      type="email"
                      name="email"
                      id="email"
                      className="w-full mt-1 p-2 border border-neutral-500 rounded-md bg-neutral-700 text-white"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-br text-black/90 from-yellow-300/80 to-yellow-700/80 hover:bg-yellow-400"
                    >
                      Submit
                    </Button>
                    <Button
                      type="button"
                      onClick={closeLoginModal}
                      className="bg-gradient-to-br text-black/90 from-gray-400/80 to-gray-600/80 hover:bg-gray-500"
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      <OtpModal isOpen={isOtpModalOpen} onClose={closeOtpModal} email={email} />
    </div>
  );
};
