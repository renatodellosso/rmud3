export const metadata = {
  title: "RMUD3",
};

export default function Page() {
  return (
    <div className="flex flex-col h-screen justify-between">
      <div>
        <h1 className="text-3xl text-white font-bold">RMUD3</h1>
      </div>
      <div>
        <button
          type="button"
          className="bg-black hover:bg-gray-600 border-1 border-white text-white py-1 px-2"
        >
          Sign In
        </button>
        <button
          type="button"
          className="bg-black hover:bg-gray-600 border-1 border-white text-white py-1 px-2"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
