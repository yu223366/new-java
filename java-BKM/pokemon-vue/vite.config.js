import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// 后端接口地址可通过环境变量配置，默认 http://localhost:8081
// 若换机器/换端口，只需改 .env 文件里的 VITE_API_TARGET
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:8081'

  return {
    plugins: [vue()],
    server: {
      port: Number(env.VITE_PORT) || 5173,
      host: true, // 监听所有网卡，手机/局域网可访问
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  }
})
