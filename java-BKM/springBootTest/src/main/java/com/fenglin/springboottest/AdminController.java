package com.fenglin.springboottest;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 后台管理系统接口
 * 管理员登录页只有登录功能(无注册)；登录时校验 role=0
 * 普通用户(role=1)无法登录后台
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    /** 管理员登录：仅 role=0 可通过 */
    @PostMapping("/login")
    public Result<?> adminLogin(@RequestBody Map<String, String> body) {
        User admin = userService.adminLogin(body.get("username"), body.get("password"));
        if (admin == null) {
            return Result.fail(401, "拒绝访问：仅管理员(权限0)可登录后台");
        }
        Map<String, Object> data = new HashMap<>();
        data.put("id", admin.getId());
        data.put("username", admin.getUsername());
        data.put("role", admin.getRole());
        data.put("token", "admin-token-" + admin.getId());
        return Result.ok(data);
    }
}
