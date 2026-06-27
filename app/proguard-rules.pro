# kotlinx.serialization — keep generated serializers and @Serializable DTOs.
-keepattributes *Annotation*, InnerClasses
-keepclassmembers class **$$serializer { *; }
-keep class dev.sergei.miniwebserver.server.dto.** { *; }

# NanoHTTPD.
-keep class fi.iki.elonen.** { *; }
-dontwarn fi.iki.elonen.**
