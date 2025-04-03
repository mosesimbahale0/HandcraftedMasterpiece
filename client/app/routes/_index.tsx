import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "ExpertForms" },
    {
      name: "description",
      content: "A collection of Tools for building Content Moderation Systems",
    },
  ];
};



export default function Index() {
  return (
    <>
      <section className="bg-primary text-text">
        <section className="flex flex-col min-h-screen items-center justify-center bg-primary py-20 container mx-auto ">
          <div className=" flex flex-col lg:flex-row  w-full">
            <div className="  w-full h-full lg:w-1/2 flex flex-col justify-center items-start gap-16  lg:py-20 lg:p-0 p-2 lg:pr-16 ">
              <div className=" w-full lg:max-w-4xl flex flex-col gap-6 justify-left items-start">
                <p className="text-sm text-left text-text2">
                  Expert Forms: Pioneering Online Safety Solutions.
                </p>
                <p
                  className="text-xl lg:text-4xl font-medium"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Redefining Content Moderation with On-Device AI.
                </p>
                <p className="text-sm text-left text-text2">
                  Harness the power of AI to proactively detect and eliminate
                  harmful content, creating a safer and more engaging online
                  environment.
                </p>
              </div>
              <div className="flex lg:flex-row flex-col gap-10 ">
                <Link
                  to="/flex"
                  className=" bg-accent hover:bg-complementary px-10 py-4 rounded-full text-text group inline-flex"
                >
                  Give it a try
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-4 h-6 w-6 transition-transform group-hover:translate-x-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="  w-full h-full lg:w-1/2 flex flex-col justify-center items-start gap-16  lg:py-20 lg:p-0 p-2  ">
              <img
                src="/Gemini_Generated_Image_5zvdm65zvdm65zvd.jpeg"
                alt="hero image"
                className=" w-full  h-96 object-cover rounded-xl"
              />
            </div>
          </div>
        </section>
      </section>
    </>
  );
}
