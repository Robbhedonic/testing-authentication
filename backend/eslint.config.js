import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
	globalIgnores(['node_modules', 'coverage']),
	{
		files: ['**/*.js'],
		extends: [js.configs.recommended],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.node,
			},
		},
	},
	{
		files: ['**/*.{test,spec}.js'],
		languageOptions: {
			globals: {
				describe: 'readonly',
				it: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				vi: 'readonly',
			},
		},
	},
])
