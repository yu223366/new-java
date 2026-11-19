package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.Gym;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GymMapper extends BaseMapper<Gym> {
}
