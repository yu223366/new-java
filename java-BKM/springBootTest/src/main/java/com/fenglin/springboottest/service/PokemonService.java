package com.fenglin.springboottest.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fenglin.springboottest.entity.Pokemon;
import com.fenglin.springboottest.mapper.PokemonMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 宝可梦服务：搜索(分级分类)、展示、后台增删改查
 */
@Service
public class PokemonService {
    @Autowired
    private PokemonMapper pokemonMapper;

    /**
     * 分级分类搜索：keyword 模糊匹配名称/描述，category 属性分类，level 稀有度等级
     */
    public List<Pokemon> search(String keyword, String category, String level) {
        LambdaQueryWrapper<Pokemon> qw = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.trim().isEmpty()) {
            String kw = keyword.trim();
            // 关键词可匹配：中文名 / 英文名 / 图鉴编号 / 描述
            qw.and(w -> w.like(Pokemon::getName, kw)
                         .or().like(Pokemon::getNameEn, kw)
                         .or().like(Pokemon::getNumber, kw)
                         .or().like(Pokemon::getDescription, kw));
        }
        if (category != null && !category.trim().isEmpty() && !"全部".equals(category)) {
            // 原著双属性：第一属性或第二属性命中即可
            String c = category.trim();
            qw.and(w -> w.eq(Pokemon::getCategory, c)
                         .or().eq(Pokemon::getCategory2, c));
        }
        if (level != null && !level.trim().isEmpty() && !"全部".equals(level)) {
            qw.eq(Pokemon::getLevel, level.trim());
        }
        qw.orderByAsc(Pokemon::getId);
        return pokemonMapper.selectList(qw);
    }

    public List<Pokemon> listAll() {
        return pokemonMapper.selectList(new LambdaQueryWrapper<Pokemon>().orderByAsc(Pokemon::getId));
    }

    public Pokemon getById(Long id) {
        return pokemonMapper.selectById(id);
    }

    public int add(Pokemon pokemon) {
        return pokemonMapper.insert(pokemon);
    }

    public int update(Pokemon pokemon) {
        return pokemonMapper.updateById(pokemon);
    }

    public int delete(Long id) {
        return pokemonMapper.deleteById(id);
    }
}
