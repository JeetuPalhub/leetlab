
export const getDriverCode = (title: string, language: string, sourceCode: string): string => {
    // Normalize language
    const lang = language.toLowerCase();

    // JavaScript / TypeScript Generator
    if (lang === 'javascript' || lang === 'typescript') {
        // Updated regex to find function definition: function name(args) { OR var name = function(args) { OR const name = (args) => {
        const functionMatch = sourceCode.match(/function\s+(\w+)\s*\(([^)]*)\)/) ||
            sourceCode.match(/(?:var|let|const)\s+(\w+)\s*=\s*(?:function)?\s*\(([^)]*)\)/);

        if (functionMatch) {
            const funcName = functionMatch[1];
            const argsStr = functionMatch[2];
            const argNames = argsStr.split(',').map(s => s.trim()).filter(s => s);
            const argCount = argNames.length;

            return `
${sourceCode}

// Driver Code (Injected)
const fs = require('fs');
try {
    const input = fs.readFileSync(0, 'utf-8').trim().split('\\n').filter(l => l.trim());
    const args = [];
    // Parse arguments based on count
    for (let i = 0; i < ${argCount}; i++) {
        if (i < input.length) {
            try {
                args.push(JSON.parse(input[i]));
            } catch (e) {
                // validation fallback for non-JSON strings
                args.push(input[i]); 
            }
        } else {
            args.push(undefined);
        }
    }
    
    // Support both direct function and Class methods if title or context suggests
    let result;
    if (typeof ${funcName} === 'function') {
        result = ${funcName}(...args);
    } else if (typeof Solution !== 'undefined' && typeof (new Solution())['${funcName}'] === 'function') {
        result = (new Solution())['${funcName}'](...args);
    }
    
    console.log(JSON.stringify(result));
} catch (error) {
    console.error(error);
    process.exit(1);
}
`;
        }
    }

    // Python Generator
    if (lang === 'python' || lang === 'python3') {
        const defMatch = sourceCode.match(/def\s+(\w+)\s*\(([^)]*)\):/);

        if (defMatch) {
            const funcName = defMatch[1];
            const argsStr = defMatch[2];
            let argNames = argsStr.split(',').map(s => s.trim()).filter(s => s);
            argNames = argNames.filter(n => n !== 'self');
            const argCount = argNames.length;

            const inputParsingLogic = `
        raw_input = sys.stdin.read().split('\\n')
        input_data = [line for line in raw_input if line.strip()]
        
        args = []
        for i, line in enumerate(input_data):
            if i >= ${argCount}: break
            try:
                args.append(json.loads(line))
            except:
                args.append(line)
            `;

            const hasClassSolution = sourceCode.includes("class Solution");

            if (hasClassSolution) {
                return `
import sys
import json

${sourceCode}

if __name__ == "__main__":
    try:
${inputParsingLogic}
        sol = Solution()
        method = getattr(sol, "${funcName}")
        result = method(*args)
        print(json.dumps(result))
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
`;
            } else {
                return `
import sys
import json

${sourceCode}

if __name__ == "__main__":
    try:
${inputParsingLogic}
        result = ${funcName}(*args)
        print(json.dumps(result))
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
`;
            }
        }
    }

    // Java Generator
    if (lang === 'java') {
        const methodMatch = sourceCode.match(/(?:public|private|static|\s)+\s+\w+\s+(\w+)\s*\(([^)]*)\)/);
        if (methodMatch && sourceCode.includes("class Solution")) {
            const methodName = methodMatch[1];
            const argsStr = methodMatch[2];
            const argTypes = argsStr.split(',').map(s => s.trim().split(/\s+/)[0]).filter(s => s);
            const argCount = argTypes.length;

            return `
import java.util.*;
import java.util.stream.*;

${sourceCode}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<String> inputs = new ArrayList<>();
        while (sc.hasNextLine()) {
            String line = sc.nextLine();
            if (line == null) break;
            inputs.add(line);
        }
        
        try {
            Solution sol = new Solution();
            // This is a simplified mapper. For complex types, users might need to adjust.
            // But for many problems, this works if inputs are passed line by line.
            Object[] parsedArgs = new Object[${argCount}];
            for (int i = 0; i < ${argCount} && i < inputs.size(); i++) {
                String input = inputs.get(i);
                String type = "${argTypes.length > 0 ? argTypes[0] : "String"}"; // Simplified type detection
                // In a real runner, we'd use reflection or more complex parsing.
                parsedArgs[i] = input; // Default to string
            }

            // Note: Calling via reflection to handle dynamic arguments in a generic way
            java.lang.reflect.Method method = Arrays.stream(Solution.class.getMethods())
                .filter(m -> m.getName().equals("${methodName}"))
                .findFirst()
                .orElse(null);

            if (method != null) {
                Object[] convertedArgs = new Object[method.getParameterCount()];
                Class<?>[] paramTypes = method.getParameterTypes();
                for (int i = 0; i < method.getParameterCount() && i < inputs.size(); i++) {
                    String val = inputs.get(i).trim();
                    if (paramTypes[i] == int.class || paramTypes[i] == Integer.class) convertedArgs[i] = Integer.parseInt(val);
                    else if (paramTypes[i] == long.class || paramTypes[i] == Long.class) convertedArgs[i] = Long.parseLong(val);
                    else if (paramTypes[i] == double.class || paramTypes[i] == Double.class) convertedArgs[i] = Double.parseDouble(val);
                    else if (paramTypes[i] == boolean.class || paramTypes[i] == Boolean.class) convertedArgs[i] = Boolean.parseBoolean(val);
                    else convertedArgs[i] = val.replace("\"", ""); // Simple string stripping
                }
                Object result = method.invoke(sol, convertedArgs);
                System.out.println(result);
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}
`;
        }
    }

    // C++ Generator
    if (lang === 'cpp' || lang === 'c++') {
        const methodMatch = sourceCode.match(/\w+\s+(\w+)\s*\(([^)]*)\)/);
        if (methodMatch && sourceCode.includes("class Solution")) {
            const methodName = methodMatch[1];
            return `
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <sstream>

${sourceCode}

int main() {
    Solution sol;
    std::string line;
    std::vector<std::string> inputs;
    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;
        inputs.push_back(line);
    }

    // Simplified C++ driver. C++ usually requires very specific parsing.
    // For many problems, we assume the method takes strings or we can't easily auto-map.
    // However, we can at least try to call it if it takes basic types.
    // This is a placeholder for a more complex C++ parser.
    return 0;
}
`;
        }
    }

    return sourceCode;
};
