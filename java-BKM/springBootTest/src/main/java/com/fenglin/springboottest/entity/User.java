package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户实体
 * role: 1=普通用户(注册默认) 0=管理员
 * 密码明文存储
 */
@Data
@TableName("t_user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private Integer role;
    private LocalDateTime createTime;
    private Integer status;

    /** 前端展示用，不映射数据库 */
    @TableField(exist = false)
    private String token;
}
