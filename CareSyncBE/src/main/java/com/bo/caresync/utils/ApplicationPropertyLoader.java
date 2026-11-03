package com.bo.caresync.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.text.MessageFormat;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/15/2026, 7:08 PM,
 **/
public class ApplicationPropertyLoader {

    private static final Logger log = LoggerFactory.getLogger(ApplicationPropertyLoader.class);
    private static final String PROPERTIES_FILE = "/application-local.properties";
    private static final Map<String, String> propertiesCache = new ConcurrentHashMap<>();
    private static volatile boolean isLoaded = false;

    private ApplicationPropertyLoader() {

    }
    private static synchronized void loadPropertiesIfNeeded() {
        if (isLoaded) {
            return;
        }
        Properties prop = new Properties();
        try (InputStream inputStream = ApplicationPropertyLoader.class.getResourceAsStream(PROPERTIES_FILE)) {
            if (inputStream == null) {
                log.error("application-local.properties file not found on classpath");
                isLoaded = true;
                return;
            }

            prop.load(inputStream);
            propertiesCache.putAll(prop.entrySet().stream()
                            .collect(Collectors.toMap(
                                    e -> String.valueOf(e.getKey()),
                                    e -> String.valueOf(e.getValue())
                            ))
            );
            isLoaded = true;
            log.info("Successfully loaded {} properties from application-local.properties", propertiesCache.size());

        } catch (IOException e) {
            log.error("IOException occurred while reading application-local.properties", e);
            isLoaded = true;
        } catch (Exception e) {
            log.error("Exception occurred while reading application-local.properties", e);
            isLoaded = true;
        }
    }

    public static String getMessageKey(String key) {
        if (key == null || key.trim().isEmpty()) {
            log.warn("Attempted to get property with null or empty key");
            return null;
        }

        loadPropertiesIfNeeded();
        String value = propertiesCache.get(key);

        if (value == null) {
            log.warn("Property not found for key: {}", key);
        }

        return value;
    }

    public static String getMessage(String key, Object... arguments) {
        String pattern = getMessageKey(key);

        if (pattern == null) {
            log.warn("Property pattern not found for key: {}", key);
            return null;
        }

        try {
            return MessageFormat.format(pattern, arguments);
        } catch (IllegalArgumentException e) {
            log.error("Error formatting message for key: {} with pattern: {}", key, pattern, e);
            return pattern;
        }
    }

    public static Map<String, String> getAllProperties() {
        loadPropertiesIfNeeded();
        return Map.copyOf(propertiesCache);
    }

    public static synchronized void clearCache() {
        propertiesCache.clear();
        isLoaded = false;
        log.info("Properties cache cleared");
    }
}
