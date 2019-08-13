import { transform } from "@babel/core";
import plugin from "..";

const testPlugin = code => {
  const result = transform(code, {
    plugins: [plugin],
    presets: ["@babel/preset-react"],
    configFile: false
  });

  return result.code;
};

describe("plugin", () => {
  it("should work with make get", () => {
    const result = testPlugin(`
        const a = 1;

        const MyComp = () => {
          ok();
          
          useEffect();
          
          const val = useState(1);
          const [value, setValue] = useState(1);
          const [value2, setValue2] = React.useState(2, 3);
        
          return <Ok />
        }
    `);

    expect(result).toMatchInlineSnapshot(`
      "const useDebugValue2 = (...args) => {
        React.useDebugValue(\\"value2\\");
        return React.useState(...args);
      };

      const useDebugValue1 = (...args) => {
        React.useDebugValue(\\"value\\");
        return useState(...args);
      };

      const useDebugValue0 = (...args) => {
        React.useDebugValue(\\"val\\");
        return useState(...args);
      };

      const a = 1;

      const MyComp = () => {
        ok();
        useEffect();
        const val = useDebugValue0(1);
        const [value, setValue] = useDebugValue1(1);
        const [value2, setValue2] = useDebugValue2(2, 3);
        return React.createElement(Ok, null);
      };"
    `);
  });
});
