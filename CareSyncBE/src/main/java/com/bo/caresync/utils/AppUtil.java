package com.bo.caresync.utils;

import java.util.Optional;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/31/2026, 5:54 PM,
 **/
public class AppUtil {
    private AppUtil() {
    }

    /**
     * Gets the name of the calling method using StackWalker
     *
     * @return method name or "UnknownMethod" if not found
     */
    public static String getMethodName() {
        return StackWalker.getInstance()
                .walk(frames -> frames.skip(1).findFirst())
                .map(StackWalker.StackFrame::getMethodName)
                .orElse("UnknownMethod");
    }
}
