import React, { useRef, useState } from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b">
      <div className="flex items-center h-14 md:h-16 px-4 md:px-6">
        <a href="#" className="-m-1 p-1 md:-m-2 md:p-2">
          <span className="sr-only">Snowflake</span>
          <img src="/music-robot-96.png" alt="Snowflake" width={48} height={48} />
        </a>
      </div>
    </header>
  );
};

const Footer: React.FC = () => {
  const today = new Date();

  return (
    <footer className="py-2 text-center text-xs">
      <span>&copy; Copyright {today.getFullYear()}.</span>
      <span> All Rights Reserved.</span>
    </footer>
  );
};

const UploadIcon: React.FC = () => {
  return (
    <span>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11 8 15.01z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
};

const App: React.FC = () => {
  const [file, setFile] = useState<File | undefined>();
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setFile(e.target.files?.[0]);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (inputRef.current) {
      inputRef.current.click();
      inputRef.current.value = '';
    }
  };

  return (
    <>
      <Header />

      <main className="container mx-auto mt-16 flex-1">
        <div className="p-8 border border-slate-500 border-dashed rounded-md">
          <div className="flex flex-col justify-center items-center gap-4">
            <UploadIcon />
            <p className="font-medium">Drop file here or</p>
            <input
              type="file"
              multiple={false}
              tabIndex={-1}
              className="sr-only"
              ref={inputRef}
              onChange={handleFileChange}
            />
            {file ? (
              <button className="border rounded border-slate-500 px-3 py-1.5 font-medium text-sm">
                Generate SHA
              </button>
            ) : (
              <button
                onClick={handleClick}
                className="border rounded border-slate-500 px-3 py-1.5 font-medium text-sm"
              >
                Browse files
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default App;
