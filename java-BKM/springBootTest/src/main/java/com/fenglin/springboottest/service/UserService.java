package com.fenglin.springboottest.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 用户服务：注册、登录、权限校验
 * role: 1=普通用户(注册默认) 0=管理员；密码明文
 */
@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;

    /** 注册：默认权限1，用户名重复返回null */
    public User register(String username, String password) {
        if (username == null || username.trim().isEmpty()
                || password == null || password.trim().isEmpty()) {
            return null;
        }
        if (userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, username)) != null) {
            return null; // 用户名已存在
        }
        User user = new User();
        user.setUsername(username.trim());
        user.setPassword(password); // 明文
        user.setRole(1);            // 注册用户默认权限1
        user.setStatus(1);
        userMapper.insert(user);
        return user;
    }

    /** 登录：返回匹配用户，失败返回null */
    public User login(String username, String password) {
        if (username == null || password == null) {
            return null;
        }
        return userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, username)
                .eq(User::getPassword, password)); // 明文比对
    }

    /** 管理员登录：必须是 role=0 */
    public User adminLogin(String username, String password) {
        User user = login(username, password);
        if (user != null && user.getRole() != null && user.getRole() == 0) {
            return user;
        }
        return null;
    }

    public List<User> listAll() {
        return userMapper.selectList(null);
    }
}
