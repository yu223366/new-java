package com.fenglin.springboottest;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户接口：注册 / 登录
 * 跨域由 CorsConfig 全局处理
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    /** 注册：默认权限1 */
    @PostMapping("/register")
    public Result<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        User user = userService.register(username, password);
        if (user == null) {
            return Result.fail("注册失败：用户名已存在或参数为空");
        }
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("username", user.getUsername());
        data.put("role", user.getRole());
        return Result.ok(data);
    }

    /** 登录：返回用户信息(含权限)，前端据此判断是否显示后台按钮 */
    @PostMapping("/login")
    public Result<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        User user = userService.login(username, password);
        if (user == null) {
            return Result.fail("用户名或密码错误");
        }
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("username", user.getUsername());
        data.put("role", user.getRole());
        data.put("token", "pokemon-token-" + user.getId()); // 简易token
        return Result.ok(data);
    }
}
