package com.ferramenta.magazzino.config;

import org.hibernate.dialect.Dialect;
import org.hibernate.dialect.identity.IdentityColumnSupport;
import org.hibernate.dialect.identity.IdentityColumnSupportImpl;
import org.hibernate.dialect.pagination.LimitHandler;
import org.hibernate.query.spi.Limit;
import java.sql.PreparedStatement;

public class SQLiteDialect extends Dialect {


    public SQLiteDialect() {
        super();
    }

    @Override
    public IdentityColumnSupport getIdentityColumnSupport() {
        return new IdentityColumnSupportImpl() {
            @Override
            public boolean supportsIdentityColumns() {
                return true;
            }

            @Override
            public String getIdentitySelectString(String table, String column, int type) {
                return "select last_insert_rowid()";
            }

            @Override
            public String getIdentityColumnString(int type) {
                return "";
            }

        };
    }

    @Override
    public boolean hasAlterTable() {
        return false;
    }

    @Override
    public boolean dropConstraints() {
        return false;
    }

    @Override
    public String getAddColumnString() {
        return "add column";
    }

    @Override
    public boolean supportsIfExistsBeforeTableName() {
        return true;
    }

    @Override
    public boolean supportsCascadeDelete() {
        return false;
    }


    @Override
    public LimitHandler getLimitHandler() {
        return new LimitHandler() {

            @Override
            public boolean supportsLimit() {
                return true;
            }

            @Override
            public boolean supportsOffset() {
                return true;
            }

            @Override
            public boolean supportsLimitOffset() {
                return true;
            }

            @Override
            public String processSql(String sql, Limit limit) {
                if (limit == null || limit.getMaxRows() == null) {
                    return sql;
                }
                int max = limit.getMaxRows();
                int offset = limit.getFirstRow() != null ? limit.getFirstRow() : 0;
                if (offset > 0) {
                    return sql + " LIMIT " + max + " OFFSET " + offset;
                } else {
                    return sql + " LIMIT " + max;
                }
            }

            @Override
            public int bindLimitParametersAtStartOfQuery(Limit limit, PreparedStatement statement, int index) {
                return 0;
            }

            @Override
            public int bindLimitParametersAtEndOfQuery(Limit limit, PreparedStatement statement, int index) {
                return 0;
            }

            @Override
            public void setMaxRows(Limit limit, PreparedStatement statement){
            }
        };
    }


}
