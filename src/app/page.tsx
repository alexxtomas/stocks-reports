import { Form } from '@/components/form';

export default function Home() {
  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold max-w-md text-center">
        Be profitable in the markets with AI
      </h1>
      <Form />
    </main>
  );
}
